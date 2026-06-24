/**
 * Guard Tactic
 * 
 * Defensive tactic for protecting a room.
 */
module.exports = {
    run: function(creep) {
        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        
        if (hostiles.length > 0) {
            const target = creep.pos.findClosestByRange(hostiles);
            
            if (creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                if (creep.pos.inRangeTo(target, 3)) {
                    creep.rangedAttack(target);
                    // Kite back if too close
                    if (creep.pos.inRangeTo(target, 2)) {
                        const path = PathFinder.search(creep.pos, {pos: target.pos, range: 3}, {flee: true});
                        creep.moveByPath(path.path);
                    }
                } else {
                    creep.moveToTarget(target, '#ff0000');
                }
            } else if (creep.getActiveBodyparts(ATTACK) > 0) {
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(target, '#ff0000');
                }
            }
        } else {
            // Idle / Patrol logic could go here
        }
    }
};