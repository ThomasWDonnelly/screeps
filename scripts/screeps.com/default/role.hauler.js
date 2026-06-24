/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.hauler');
 * mod.thing == 'a thing'; // true
 */
var roleHauler = {

    /** @param {Creep} creep **/
    run: function (creep) {
        // Toggle state
        if (creep.memory.hauling && creep.store.getUsedCapacity() == 0) {
            creep.memory.hauling = false;
            creep.say('🔄 collect');
        }
        if (!creep.memory.hauling && creep.store.getFreeCapacity() == 0) {
            creep.memory.hauling = true;
            creep.say('🚚 deliver');
        }

        if (creep.memory.hauling) {
            // 1. Deliver Power
            if (creep.store[RESOURCE_POWER] > 0) {
                var powerSpawn = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: { structureType: STRUCTURE_POWER_SPAWN }
                })[0];

                if (powerSpawn && powerSpawn.store.getFreeCapacity(RESOURCE_POWER) > 0) {
                    if (creep.transfer(powerSpawn, RESOURCE_POWER) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(powerSpawn, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                    return;
                } else if (creep.room.storage) {
                    if (creep.transfer(creep.room.storage, RESOURCE_POWER) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                    return;
                }
            }

            // 2. Deliver Energy
            if (creep.store[RESOURCE_ENERGY] > 0) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER ||
                            structure.structureType == STRUCTURE_POWER_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });

                if (targets.length > 0) {
                    var target = creep.pos.findClosestByRange(targets);
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                } else {
                    // If everything is full, store in Storage (if available)
                    if (creep.room.storage) {
                        if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage, { visualizePathStyle: { stroke: '#ffffff' } });
                        }
                    }
                }
            }
        }
        else {
            // 1. Prioritize dropped resources near an active miner
            const droppedResource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                filter: (r) => {
                    return r.amount > 50 &&
                        (r.resourceType == RESOURCE_ENERGY || r.resourceType == RESOURCE_POWER) &&
                        r.pos.findInRange(FIND_MY_CREEPS, 1, { filter: c => c.memory.role === 'miner' }).length > 0;
                }
            });

            if (droppedResource) {
                if (creep.pickup(droppedResource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedResource, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
            } else {
                // 2. Withdraw from the fullest container first
                const containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store.getUsedCapacity() > 0
                });

                if (containers.length > 0) {
                    // Find the container with the most resources
                    const targetContainer = _.max(containers, (c) => c.store.getUsedCapacity());

                    if (targetContainer) {
                        // Withdraw whatever resource is in the container, prioritizing Power
                        const resourceType = targetContainer.store[RESOURCE_POWER] > 0 ? RESOURCE_POWER : Object.keys(targetContainer.store)[0];

                        if (creep.withdraw(targetContainer, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targetContainer, { visualizePathStyle: { stroke: '#ffaa00' } });
                        }
                    }
                }
            }
        }
    }
};

module.exports = roleHauler;
