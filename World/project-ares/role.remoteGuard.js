var roleRemoteGuard = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var flag = Game.flags['Remote'];
        if(!flag) return;

        // 1. Move to Remote Room
        if(creep.room.name !== flag.pos.roomName) {
            creep.moveToTarget(flag, '#ff0000');
            return;
        }

        // 2. Attack Hostiles
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(target) {
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveToTarget(target, '#ff0000');
            }
            return;
        }

        // 3. Attack Hostile Structures (excluding controller)
        var hostileStructure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: (s) => s.structureType != STRUCTURE_CONTROLLER
        });
        if(hostileStructure) {
            if(creep.attack(hostileStructure) == ERR_NOT_IN_RANGE) {
                creep.moveToTarget(hostileStructure, '#ff0000');
            }
            return;
        }

        // 4. Patrol/Idle at Flag
        if(!creep.pos.inRangeTo(flag, 3)) {
            creep.moveToTarget(flag, '#ff0000');
        }
    }
};
module.exports = roleRemoteGuard;