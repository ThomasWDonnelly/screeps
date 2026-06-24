/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */

let roleBuilder = {
    /** @param {Creep} creep **/
    build: function(creep) {
        return console.log('This function is not yet implemented');
    }
    /** @param {Creep} creep **/
    ,run: function(creep) {
        // If creep is working and doesnt have any stored energy 
        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('⛏️ harvest');
        }
        // If creep is NOT working and has the free carry capacity
        if(!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
            creep.say('🚧 build');
        }

        // If creep is working then find construction sites
        if(creep.memory.working) {
            let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff'}});
                }
            } else {
                let sources = creep.room.find(FIND_SOURCES);
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00'}});
                }
            }
        }
    }
};

module.exports = roleBuilder;