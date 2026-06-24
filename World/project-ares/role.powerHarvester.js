var rolePowerHarvester = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // State toggle
        if(creep.memory.hauling && creep.store.getUsedCapacity() == 0) {
            creep.memory.hauling = false;
            creep.say('🔄 collect');
        }
        if(!creep.memory.hauling && creep.store.getFreeCapacity() == 0) {
            creep.memory.hauling = true;
            creep.say('🚚 deliver');
        }

        if(creep.memory.hauling) {
            // Return to home room (spawn room)
            var spawn = Game.spawns['Spawn1'] || Object.values(Game.spawns)[0];
            if(spawn) {
                if(creep.room.name !== spawn.room.name) {
                    creep.moveToTarget(spawn.pos, '#ffffff');
                } else {
                    // Prioritize Power Spawn, then Storage
                    var powerSpawn = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: { structureType: STRUCTURE_POWER_SPAWN }
                    })[0];
                    
                    if (powerSpawn && powerSpawn.store.getFreeCapacity(RESOURCE_POWER) > 0) {
                        if(creep.transfer(powerSpawn, RESOURCE_POWER) == ERR_NOT_IN_RANGE) {
                            creep.moveToTarget(powerSpawn, '#ffffff');
                        }
                    } else if (creep.room.storage) {
                        for(const resourceType in creep.store) {
                            if(creep.transfer(creep.room.storage, resourceType) == ERR_NOT_IN_RANGE) {
                                creep.moveToTarget(creep.room.storage, '#ffffff');
                            }
                        }
                    }
                }
            }
        } else {
            var flag = Game.flags['Power'];
            if(flag) {
                if(creep.room.name !== flag.pos.roomName) {
                    creep.moveToTarget(flag, '#ffaa00');
                } else {
                    // 1. Pick up Dropped Power
                    const dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, { filter: (r) => r.resourceType == RESOURCE_POWER });
                    if(dropped) {
                        if(creep.pickup(dropped) == ERR_NOT_IN_RANGE) {
                            creep.moveToTarget(dropped, '#ffaa00');
                        }
                    } else {
                        // 2. Loot Ruins (if capacity allows)
                        const ruin = creep.pos.findClosestByRange(FIND_RUINS, {
                            filter: (r) => r.store.getUsedCapacity() > 0
                        });
                        if (ruin) {
                            for(const resourceType in ruin.store) {
                                if(creep.withdraw(ruin, resourceType) == ERR_NOT_IN_RANGE) {
                                    creep.moveToTarget(ruin, '#ffaa00');
                                }
                                return;
                            }
                        }

                        // 3. Wait near Power Bank (if it exists)
                        const powerBank = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_POWER_BANK });
                        if (powerBank && !creep.pos.inRangeTo(powerBank, 3)) {
                            creep.moveToTarget(powerBank, '#ffaa00');
                        }
                    }
                }
            }
        }
    }
};
module.exports = rolePowerHarvester;