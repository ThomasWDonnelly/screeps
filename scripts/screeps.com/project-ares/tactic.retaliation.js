/**
 * Retaliation Tactic
 * 
 * Aggressive counter-attack logic targeting infrastructure.
 */
module.exports = {
    run: function(creep) {
        const flag = Game.flags['Retaliate'];
        if (flag && creep.room.name !== flag.pos.roomName) {
            creep.moveToTarget(flag, '#ff0000');
            return;
        }

        let target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_TOWER
        });

        if (!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        }

        if (target) {
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                creep.moveToTarget(target, '#ff0000');
            }
        }
    }
};