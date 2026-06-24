/**
 * Role: Archaeologist
 * 
 * Finds and recovers resources from 'ancient debris' like ruins and tombstones.
 */
const roleArchaeologist = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // State machine for collecting vs. returning
        if (creep.memory.working && creep.store.getUsedCapacity() == 0) {
            creep.memory.working = false;
            creep.say('🔍 digging');
        }
        if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
            creep.say('🏛️ returning');
        }

        if (creep.memory.working) {
            // Returning resources to storage or terminal
            let target = creep.room.storage || creep.room.terminal;
            if (target) {
                for (const resourceType in creep.store) {
                    if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(target, '#ffffff');
                    }
                }
            }
        } else {
            // Find ruins first, then tombstones
            let target = creep.pos.findClosestByPath(FIND_RUINS, {
                filter: r => r.store.getUsedCapacity() > 0
            });

            if (!target) {
                target = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                    filter: t => t.store.getUsedCapacity() > 0
                });
            }

            if (target) {
                // Withdraw any resource from the target
                for (const resourceType in target.store) {
                    if (creep.withdraw(target, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(target, '#ffaa00');
                    }
                    return; // Only attempt one withdraw per tick
                }
            }
        }
    }
};

module.exports = roleArchaeologist;