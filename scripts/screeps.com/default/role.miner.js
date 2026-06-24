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
    run: function (creep) {
        if (creep.memory && creep.memory.role === 'miner') {
            let target = creep.memory.targetId ? Game.getObjectById(creep.memory.targetId) : null;

            // If the cached target is gone (e.g., mineral depleted), clear the cache.
            if (!target) {
                delete creep.memory.targetId;

                // 1. Priority: Find an available Mineral deposit.
                let minerals = creep.room.find(FIND_MINERALS);
                let mineral = creep.pos.findClosestByPath(minerals, {
                    filter: (m) => {
                        let hasExtractor = m.pos.lookFor(LOOK_STRUCTURES).some(s => s.structureType == STRUCTURE_EXTRACTOR);
                        if (!hasExtractor) return false;
                        // Check if another miner is already at this spot.
                        return m.pos.findInRange(FIND_CREEPS, 1, {
                            filter: (c) => c.memory.role == 'miner' && c.id !== creep.id
                        }).length == 0;
                    }
                });

                if (mineral) {
                    target = mineral;
                } else {
                    // 2. Fallback: Find an available Energy Source.
                    var sources = creep.room.find(FIND_SOURCES);
                    var source = creep.pos.findClosestByPath(sources, {
                        filter: (s) => s.pos.findInRange(FIND_CREEPS, 1, {
                            filter: (c) => c.memory.role == 'miner' && c.id !== creep.id
                        }).length == 0
                    });

                    // If all sources are taken, just go to the closest one (fallback).
                    if (!source) {
                        source = creep.pos.findClosestByPath(sources);
                    }
                    target = source;
                }

                // If a new target was found, cache its ID.
                if (target) {
                    creep.memory.targetId = target.id;
                }
            }

            if (target) {
                const harvestResult = creep.harvest(target);
                if (harvestResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
                } else if (harvestResult === ERR_NOT_ENOUGH_RESOURCES) {
                    // The mineral or source is empty, clear the cache to find a new target next tick.
                    delete creep.memory.targetId;
                } else {
                    // If full, prioritize Link > Container > Drop
                    if (creep.store.getFreeCapacity() === 0) {
                        // Find the most abundant resource the creep is carrying.
                        const resourceType = Object.keys(creep.store).reduce((a, b) => creep.store[a] > creep.store[b] ? a : b);

                        // Find the closest available link or container within range 1.
                        const storage = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (s) =>
                                s.pos.inRangeTo(creep.pos, 1) &&
                                ((s.structureType === STRUCTURE_LINK && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
                                    (s.structureType === STRUCTURE_CONTAINER && s.store.getFreeCapacity(resourceType) > 0))
                        });

                        if (storage) {
                            // Prioritize transferring energy to links.
                            if (storage.structureType === STRUCTURE_LINK && creep.store[RESOURCE_ENERGY] > 0) {
                                creep.transfer(storage, RESOURCE_ENERGY);
                            } else if (storage.structureType === STRUCTURE_CONTAINER) {
                                creep.transfer(storage, resourceType);
                            }
                            // If storage is a link but creep has no energy, it will drop below.
                        } else {
                            // 3. Fallback: Drop the resource if no container/link is available.
                            // This is often better than the miner just sitting idle.
                            if (creep.store[resourceType] > 0) {
                                creep.drop(resourceType);
                            }
                        }
                    }
                }
            }
        } else {
            console.log(`Warning: Creep ${creep.name} has an invalid or missing role. Expected 'miner'.`);
        }
    }
};

module.exports = roleMiner;
