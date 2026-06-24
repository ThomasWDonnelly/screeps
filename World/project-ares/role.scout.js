/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.scout');
 * mod.thing == 'a thing'; // true
 */
let roleScout = {
    /** @param {Creep} creep **/
    run: function (creep) {
        let flag = Game.flags['Scout'];
        if(flag) {
            if(!creep.pos.inRangeTo(flag, 1)) {
                creep.moveToTarget(flag, '#ffffff');
            } else {
                if(creep.room.controller) {
                    if(creep.signController(creep.room.controller, 'Scouting Area') == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(creep.room.controller, '#ffffff');
                    }
                }
            }
        }
    }
};

module.exports = roleScout;