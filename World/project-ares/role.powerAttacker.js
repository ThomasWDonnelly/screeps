var rolePowerAttacker = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var flag = Game.flags['Power'];
        if(!flag) return;

        if(creep.room.name !== flag.pos.roomName) {
            creep.moveToTarget(flag, '#ff0000');
            return;
        }

        // Self-preservation: Heal if damaged (Power Banks reflect damage)
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }

        var powerBank = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_POWER_BANK }
        });

        if(powerBank) {
            // Only attack if fully healthy (to survive reflection)
            if (creep.hits == creep.hitsMax) {
                if(creep.attack(powerBank) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(powerBank, '#ff0000');
                }
            } else if (!creep.pos.inRangeTo(powerBank, 1)) {
                creep.moveToTarget(powerBank, '#ff0000');
            }
        } else {
            if(!creep.pos.inRangeTo(flag, 3)) {
                creep.moveToTarget(flag, '#ff0000');
            }
        }
    }
};
module.exports = rolePowerAttacker;