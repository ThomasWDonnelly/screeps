/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */
var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        let target = null;

        // 1. Priority: Minerals (with Extractor, no miner)
        let minerals = creep.room.find(FIND_MINERALS);
        let mineral = creep.pos.findClosestByPath(minerals, {
            filter: (m) => {
                let hasExtractor = m.pos.lookFor(LOOK_STRUCTURES).some(s => s.structureType == STRUCTURE_EXTRACTOR);
                if (!hasExtractor) return false;
                return m.pos.findInRange(FIND_CREEPS, 1, {
                    filter: (c) => c.memory.role == 'miner' && c.id !== creep.id
                }).length == 0;
            }
        });

        if (mineral) {
            target = mineral;
        } else {
            // 2. Fallback: Energy Sources
            var sources = creep.room.find(FIND_SOURCES);
            var source = creep.pos.findClosestByPath(sources, {
                filter: (s) => s.pos.findInRange(FIND_CREEPS, 1, {
                    filter: (c) => c.memory.role == 'miner' && c.id !== creep.id
                }).length == 0
            });

            // If all sources are taken, just go to the closest one (fallback)
            if (!source) {
                source = creep.pos.findClosestByPath(sources);
            }
            target = source;
        }

        if (target) {
            if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else {
                // If full, prioritize Link > Container > Drop
                if (creep.store.getFreeCapacity() === 0) {
                    for(const resourceType of Object.keys(creep.store)) {
                        // 1. Try Link (Only for Energy)
                        if (resourceType == RESOURCE_ENERGY) {
                            let link = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                                filter: (s) => s.structureType == STRUCTURE_LINK && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                            });
                            if (link && creep.pos.inRangeTo(link, 1)) {
                                creep.transfer(link, RESOURCE_ENERGY);
                                continue;
                            }
                        }

                        // 2. Try Container (under feet or nearby)
                        let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store.getFreeCapacity(resourceType) > 0
                        });
                        if (container && creep.pos.inRangeTo(container, 1)) {
                            creep.transfer(container, resourceType);
                            continue;
                        }

                        // 3. Drop
                        creep.drop(resourceType);
                    }
                }
            }
        }
    }
};

module.exports = roleMiner;
