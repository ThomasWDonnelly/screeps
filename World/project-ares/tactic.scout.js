/**
 * Scout Tactic
 * 
 * Exploration and Intel gathering.
 */
module.exports = {
    run: function(creep) {
        const flag = Game.flags['Explore'];
        if (flag && !creep.pos.inRangeTo(flag, 5)) {
            creep.moveToTarget(flag, '#ffffff');
        }

        // Record Intel
        if (!Memory.intel) Memory.intel = {};
        Memory.intel[creep.room.name] = {
            owner: creep.room.controller ? (creep.room.controller.owner ? creep.room.controller.owner.username : null) : null,
            rcl: creep.room.controller ? creep.room.controller.level : 0,
            sources: creep.room.find(FIND_SOURCES).length,
            lastScouted: Game.time
        };
        
        creep.say('👁️');
    }
};