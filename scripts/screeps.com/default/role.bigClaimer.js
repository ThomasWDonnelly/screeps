/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.bigClaimer');
 * mod.thing == 'a thing'; // true
 */
var roleBigClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var flag = Game.flags['Reserve'];
        if(flag) {
            if(!creep.pos.inRangeTo(flag, 1)) {
                creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffffff'}});
            } else {
                if(creep.room.controller) {
                    if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }
                }
            }
        }
    }
};

module.exports = roleBigClaimer;