var roleBoostManager = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // Setup: room.memory.boostConfig = { labId: '...', mineral: '...' }
        let config = creep.room.memory.boostConfig;
        if (!config || !config.labId || !config.mineral) return;

        let lab = Game.getObjectById(config.labId);
        if (!lab) return;

        // State toggle
        if(creep.memory.hauling && creep.store.getUsedCapacity() == 0) {
            creep.memory.hauling = false;
            creep.say('🔄 collect');
        }
        if(!creep.memory.hauling && creep.store.getFreeCapacity() == 0) {
            creep.memory.hauling = true;
            creep.say('⚡ charge');
        }

        if (creep.memory.hauling) {
            // Deliver to Lab
            // Check if carrying the right mineral
            if (creep.store[config.mineral] > 0) {
                if (creep.transfer(lab, config.mineral) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(lab, '#ffffff');
                }
            } else if (creep.store[RESOURCE_ENERGY] > 0) {
                // Also fill energy if needed
                if (lab.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    if (creep.transfer(lab, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(lab, '#ffffff');
                    }
                } else {
                    // Dump wrong resource
                    creep.drop(RESOURCE_ENERGY);
                }
            } else {
                // Carrying something else?
                let wrong = Object.keys(creep.store).find(r => r !== config.mineral && r !== RESOURCE_ENERGY);
                if (wrong) creep.drop(wrong);
            }
        } else {
            // Collect Mineral
            let source = creep.room.storage || creep.room.terminal;
            if (source) {
                // Prioritize Mineral
                if (lab.store.getFreeCapacity(config.mineral) > 0 && source.store[config.mineral] > 0) {
                    if (creep.withdraw(source, config.mineral) == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(source, '#ffaa00');
                    }
                } 
                // Then Energy
                else if (lab.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && source.store[RESOURCE_ENERGY] > 0) {
                    if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(source, '#ffaa00');
                    }
                }
            }
        }
    },

    /**
     * Trigger labs to boost nearby creeps
     * @param {Room} room 
     */
    boostCreeps: function(room) {
        let config = room.memory.boostConfig;
        if (!config || !config.labId || !config.mineral) return;

        let lab = Game.getObjectById(config.labId);
        if (!lab) return;

        // Find creeps nearby (range 1) that are not the manager
        let creeps = lab.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: (c) => c.memory.role !== 'boostManager'
        });
        for (let creep of creeps) {
            lab.boostCreep(creep);
        }
    }
};
module.exports = roleBoostManager;