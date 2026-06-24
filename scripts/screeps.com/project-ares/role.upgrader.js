/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.upgrader');
 * mod.thing == 'a thing'; // true
 */
let roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        creep.checkEnergyState('upgrading', '⚡ upgrade', '🔄 harvest');

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveToTarget(creep.room.controller, '#ffffff');
            }
        }
        else {
            // 1. Try Withdraw from Link (if available near controller)
            let link = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LINK && s.store[RESOURCE_ENERGY] > 0
            });
            if (link && creep.pos.inRangeTo(link, 5)) {
                if(creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(link, '#ffaa00');
                }
                return;
            }

            creep.getEnergy(false, true);
        }
	}
};

module.exports = roleUpgrader;