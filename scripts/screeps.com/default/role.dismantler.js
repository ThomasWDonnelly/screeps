/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.dismantler');
 * mod.thing == 'a thing'; // true
 */
var roleDismantler = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // Move to 'Breach' flag to target specific walls
        var flag = Game.flags['Breach'];
        if(flag) {
            if(!creep.pos.inRangeTo(flag, 1)) {
                creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffffff'}});
            } else {
                var target = flag.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART);
                if(target) {
                    creep.dismantle(target);
                }
            }
        }
    }
};

module.exports = roleDismantler;