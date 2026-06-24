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
    run: function(creep) {
        // Toggle state
        if(creep.memory.hauling && creep.store.getUsedCapacity() == 0) {
            creep.memory.hauling = false;
            creep.say('🔄 collect');
        }
        if(!creep.memory.hauling && creep.store.getFreeCapacity() == 0) {
            creep.memory.hauling = true;
            creep.say('🚚 deliver');
        }

        if(creep.memory.hauling) {
            // 1. Deliver Power
            if (creep.store[RESOURCE_POWER] > 0) {
                var powerSpawn = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: { structureType: STRUCTURE_POWER_SPAWN }
                })[0];
                
                if (powerSpawn && powerSpawn.store.getFreeCapacity(RESOURCE_POWER) > 0) {
                    if(creep.transfer(powerSpawn, RESOURCE_POWER) == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(powerSpawn, '#ffffff');
                    }
                    return;
                } else if (creep.room.storage) {
                    if(creep.transfer(creep.room.storage, RESOURCE_POWER) == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(creep.room.storage, '#ffffff');
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
            
            if(targets.length > 0) {
                var target = creep.pos.findClosestByRange(targets);
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(target, '#ffffff');
                }
            } else {
                // If everything is full, store in Storage (if available)
                if (creep.room.storage) {
                    if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(creep.room.storage, '#ffffff');
                    }
                }
            }
            }
        }
        else {
            // 1. Pick up Dropped Resources (Energy or Power)
            const droppedResource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                filter: (r) => (r.resourceType == RESOURCE_ENERGY || r.resourceType == RESOURCE_POWER) && r.amount > 50
            });
            
            if(droppedResource) {
                if(creep.pickup(droppedResource) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(droppedResource, '#ffaa00');
                }
            } else {
                // 2. Withdraw from Containers
                const container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store.getUsedCapacity() > 0
                });
                
                if(container) {
                    if (container.store[RESOURCE_POWER] > 0) {
                        if(creep.withdraw(container, RESOURCE_POWER) == ERR_NOT_IN_RANGE) {
                            creep.moveToTarget(container, '#ffaa00');
                        }
                    } else if (container.store[RESOURCE_ENERGY] > 0) {
                        if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveToTarget(container, '#ffaa00');
                        }
                    }
                }
            }
        }
    }
};

module.exports = roleHauler;
