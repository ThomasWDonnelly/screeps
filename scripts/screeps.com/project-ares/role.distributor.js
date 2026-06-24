/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.distributor');
 * mod.thing == 'a thing'; // true
 */
var roleDistributor = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.distributing && creep.store.getUsedCapacity() == 0) {
            creep.memory.distributing = false;
            creep.say('🔄 gather');
        }
        if(!creep.memory.distributing && creep.store.getFreeCapacity() == 0) {
            creep.memory.distributing = true;
            creep.say('🚚 distribute');
        }

        if(creep.memory.distributing) {
            // Deliver Energy to Spawns/Extensions first, then Storage
            if(creep.store[RESOURCE_ENERGY] > 0) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN) &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                
                if(targets.length > 0) {
                    var target = creep.pos.findClosestByRange(targets);
                    if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(target, '#ffffff');
                    }
                } else if (creep.room.storage) {
                    if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(creep.room.storage, '#ffffff');
                    }
                }
            } else {
                // Deliver Minerals to Storage
                if(creep.room.storage) {
                    for(const resourceType in creep.store) {
                        if(creep.transfer(creep.room.storage, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.moveToTarget(creep.room.storage, '#ffffff');
                            break;
                        }
                    }
                }
            }
        }
        else {
            // Gather from Terminal if > 3000
            if(creep.room.terminal) {
                for(const resourceType in creep.room.terminal.store) {
                    if(creep.room.terminal.store[resourceType] > 3000) {
                        if(creep.withdraw(creep.room.terminal, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.moveToTarget(creep.room.terminal, '#ffaa00');
                        }
                        return;
                    }
                }
            }
        }
    }
};

module.exports = roleDistributor;