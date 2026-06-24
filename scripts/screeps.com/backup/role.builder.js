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
    run: function(creep) {

	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            var target = null;

            if(targets.length) {
                // Prioritize Roads
                var roadSites = _.filter(targets, (s) => s.structureType == STRUCTURE_ROAD);
                
                if (roadSites.length > 0) {
                    target = creep.pos.findClosestByPath(roadSites);
                }
                
                // If no reachable roads, or no roads at all, find closest reachable site
                if (!target) {
                    target = creep.pos.findClosestByPath(targets);
                }
            }

            if(target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                // Fallback: Upgrade controller if no build sites OR no reachable sites
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
	    }
	    else {
            // Prioritize withdrawing from storage/containers
            var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) &&
                               s.store[RESOURCE_ENERGY] > 50
            });
            
            if(container) {
                if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
    	        var sources = creep.room.find(FIND_SOURCES);
                sources.sort((a, b) => {
                    var countA = a.pos.findInRange(FIND_CREEPS, 1, {filter: c => c.id !== creep.id}).length;
                    var countB = b.pos.findInRange(FIND_CREEPS, 1, {filter: c => c.id !== creep.id}).length;
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
	}
};

module.exports = roleBuilder;