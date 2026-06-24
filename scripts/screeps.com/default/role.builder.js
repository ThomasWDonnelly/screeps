/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if (creep.memory.building) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            var target = null;

            if (targets.length) {
                // Define a priority order for construction
                const priorityOrder = [
                    STRUCTURE_SPAWN,
                    STRUCTURE_EXTENSION,
                    STRUCTURE_TOWER,
                    STRUCTURE_STORAGE,
                    STRUCTURE_LINK,
                    STRUCTURE_CONTAINER,
                    STRUCTURE_ROAD
                ];

                for (const structureType of priorityOrder) {
                    const sites = _.filter(targets, s => s.structureType === structureType);
                    if (sites.length > 0) {
                        target = creep.pos.findClosestByPath(sites);
                        if (target) {
                            break; // Found a reachable target of the current priority
                        }
                    }
                }

                // If no priority targets were found or are reachable, find any other reachable site
                if (!target) {
                    const otherSites = _.filter(targets, s => !priorityOrder.includes(s.structureType));
                    if (otherSites.length > 0) {
                        target = creep.pos.findClosestByPath(otherSites);
                    }
                }
            }

            if (target) {
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                // Fallback: Upgrade controller if no build sites OR no reachable sites
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        }
        else {
            // Prioritize withdrawing from storage/containers
            var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) &&
                    s.store[RESOURCE_ENERGY] > 50
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

module.exports = roleBuilder;