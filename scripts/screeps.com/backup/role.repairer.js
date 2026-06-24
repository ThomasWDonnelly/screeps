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
    run: function(creep) {

        if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
            creep.memory.repairing = true;
            creep.say('🔧 repair');
        }

        if(creep.memory.repairing) {
            // 1. Prioritize Roads and Containers
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_ROAD || structure.structureType == STRUCTURE_CONTAINER) &&
                        structure.hits < structure.hitsMax;
                }
            });

            if(targets.length > 0) {
                // Repair closest high priority target
                let target = creep.pos.findClosestByRange(targets);
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                // 2. Repair anything else (excluding walls/ramparts for now to save energy)
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) &&
                            structure.hits < structure.hitsMax;
                    }
                });
                
                if(targets.length > 0) {
                    let target = creep.pos.findClosestByRange(targets);
                    if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    // 3. If nothing to repair, help build
                    var constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
                    if(constructionSites.length) {
                        if(creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(constructionSites[0], {visualizePathStyle: {stroke: '#ffffff'}});
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
            if(container) {
                if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                var sources = creep.room.find(FIND_SOURCES);
                sources.sort((a, b) => {
                    var countA = a.pos.findInRange(FIND_CREEPS, 1, {filter: c => c.id !== creep.id}).length;
                    var countB = b.pos.findInRange(FIND_CREEPS, 1, {filter: c => c.id !== creep.id}).length;
                    if (countA !== countB) return countA - countB;
                    return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                });
                
                if(sources.length > 0) {
                    if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
            }
        }
    }
};

module.exports = roleRepairer;
