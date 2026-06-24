/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.wallRepairer');
 * mod.thing == 'a thing'; // true
 */
var roleWallRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        creep.checkEnergyState('repairing', '🚧 fortify', '🔄 harvest');

        if(creep.memory.repairing) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (object) => {
                    return (object.structureType == STRUCTURE_WALL || object.structureType == STRUCTURE_RAMPART) &&
                        object.hits < global.config.settings.wallTargetHits;
                }
            });

            if(targets.length > 0) {
                // Prioritize lowest hits
                targets.sort((a, b) => a.hits - b.hits);
                
                if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(targets[0], '#ffffff');
                }
            } else {
                // Fallback: Upgrade controller
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(creep.room.controller, '#ffffff');
                }
            }
        }
        else {
            creep.getEnergy(true, true);
        }
    }
};

module.exports = roleWallRepairer;