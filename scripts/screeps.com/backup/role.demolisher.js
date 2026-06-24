/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.demolisher');
 * mod.thing == 'a thing'; // true
 */
var roleDemolisher = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // 1. Move to 'Demolish' flag if defined
        var flag = Game.flags['Demolish'];
        if(flag) {
            if(!creep.pos.inRangeTo(flag, 1)) {
                creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffffff'}});
            } else {
                var structures = flag.pos.lookFor(LOOK_STRUCTURES);
                if(structures.length > 0) {
                    creep.dismantle(structures[0]);
                }
            }
            return;
        }

        // 2. Auto-Demolish Hostile Structures
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => structure.structureType != STRUCTURE_CONTROLLER
        });
        
        if(target) {
            if(creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        }
    }
};

module.exports = roleDemolisher;