/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.repairer');
 * mod.thing == 'a thing'; // true
 */
var roleRepairer = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
            creep.memory.repairing = true;
            creep.say('🔧 repair');
        }

        if (creep.memory.repairing) {
            // Find all structures needing repair (excluding walls, which wallRepairer handles)
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
            });

            if (targets.length > 0) {
                // Prioritize the structure with the lowest health percentage
                targets.sort((a, b) => (a.hits / a.hitsMax) - (b.hits / b.hitsMax));

                let target = targets[0];
                if (target) {
                    if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                } else {
                    // If nothing to repair, help build
                    var constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
                    if (constructionSites.length) {
                        if (creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(constructionSites[0], { visualizePathStyle: { stroke: '#ffffff' } });
                        }
                    }
                }
            }
        }
        else {
            // Prioritize withdrawing from containers/storage
            var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) &&
                    s.store[RESOURCE_ENERGY] > 0
            });
            if (container) {
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                var sources = creep.room.find(FIND_SOURCES);
                sources.sort((a, b) => {
                    var countA = a.pos.findInRange(FIND_CREEPS, 1, { filter: c => c.id !== creep.id }).length;
                    var countB = b.pos.findInRange(FIND_CREEPS, 1, { filter: c => c.id !== creep.id }).length;
                    if (countA !== countB) return countA - countB;
                    return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                });

                if (sources.length > 0) {
                    if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
            }
        }
    }
};

module.exports = roleRepairer;
