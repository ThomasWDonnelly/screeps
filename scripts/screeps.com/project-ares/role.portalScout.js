var rolePortalScout = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 0. Load up resources if empty and capable
        if (creep.store.getFreeCapacity() > 0 && creep.store.getUsedCapacity() == 0 && !creep.memory.readyToTravel) {
            let source = creep.room.storage || creep.room.terminal;
            if (source && source.store[RESOURCE_ENERGY] > 0) {
                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(source, '#ffffff');
                }
                return;
            } else {
                // No source or empty, just go
                creep.memory.readyToTravel = true;
            }
        } else {
            creep.memory.readyToTravel = true;
        }

        // 1. Move to Portal Flag
        var flag = Game.flags['Portal'];
        if (flag) {
            if (creep.room.name !== flag.pos.roomName) {
                creep.moveToTarget(flag, '#ffffff');
                return;
            }
        }

        // 2. Find and Enter Portal
        var portal = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_PORTAL
        });

        if (portal) {
            creep.moveToTarget(portal, '#ffffff');
        }
    }
};
module.exports = rolePortalScout;