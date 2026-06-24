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

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            // 1. Try Withdraw from Link (if available near controller)
            let link = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LINK && s.store[RESOURCE_ENERGY] > 0
            });
            if (link && creep.pos.inRangeTo(link, 5)) {
                if(creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(link, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                return;
            }

            let sources = creep.room.find(FIND_SOURCES);
            sources.sort((a, b) => {
                let countA = a.pos.findInRange(FIND_CREEPS, 1, {filter: c => c.id !== creep.id}).length;
                let countB = b.pos.findInRange(FIND_CREEPS, 1, {filter: c => c.id !== creep.id}).length;
                if (countA !== countB) return countA - countB;
                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
            });
            
            if(sources.length > 0) {
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
	}
};

module.exports = roleUpgrader;