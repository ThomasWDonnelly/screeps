/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {

        creep.checkEnergyState('building', '🚧 build', '🔄 harvest');

        if (creep.memory.building) {
            let target = Game.getObjectById(creep.memory.targetId);

            // If target is invalid or gone, find a new one
            if (!target) {
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if (targets.length) {
                    // Prioritize Roads
                    var roadSites = _.filter(targets, (s) => s.structureType == STRUCTURE_ROAD);

                    if (roadSites.length > 0) {
                        target = creep.pos.findClosestByPath(roadSites);
                    }

                    // If no reachable roads, or no roads at all, find closest reachable site
                    if (!target) {
                        target = creep.pos.findClosestByPath(targets);
                    }

                    if (target) {
                        creep.memory.targetId = target.id;
                    }
                }
            }

            if (target) {
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(target, '#ffffff');
                }
            } else {
                // Fallback: Upgrade controller if no build sites OR no reachable sites
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    delete creep.memory.targetId; // Clear target when switching to upgrade
                    creep.moveToTarget(creep.room.controller, '#ffffff');
                }
            }
        }
        else {
            creep.getEnergy(true, true);
        }
    }
};

module.exports = roleBuilder;