/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.repairer');
 * mod.thing == 'a thing'; // true
 */
var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        creep.checkEnergyState('repairing', '🔧 repair', '🔄 harvest');

        if(creep.memory.repairing) {
            // 1. Prioritize Roads and Containers
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_ROAD || structure.structureType == STRUCTURE_CONTAINER) &&
                        structure.hits < structure.hitsMax;
                }
            });

            if(targets.length > 0) {
                // Repair closest high priority target
                let target = creep.pos.findClosestByRange(targets);
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(target, '#ffffff');
                }
            } else {
                // 2. Repair anything else (excluding walls/ramparts for now to save energy)
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) &&
                            structure.hits < structure.hitsMax;
                    }
                });
                
                if(targets.length > 0) {
                    let target = creep.pos.findClosestByRange(targets);
                    if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(target, '#ffffff');
                    }
                } else {
                    // 3. If nothing to repair, help build
                    var constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
                    if(constructionSites.length) {
                        if(creep.build(constructionSites[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveToTarget(constructionSites[0], '#ffffff');
                        }
                    }
                }
            }
        }
        else {
            creep.getEnergy(true, true);
        }
    }
};

module.exports = roleRepairer;
