/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */

let roleHarvester = {
    /** @param {Creep} creep **/
    beta: function(creep) {
        if(creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('📦 transfer');
        }
        if(!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
            creep.say('⛏️ harvest');
        }

        if(creep.memory.working) {
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00'} });
            }
        } else {}
    }
    /** @param {Creep} creep **/
    ,build: function(creep) {
        for(let name in Game.creeps) {
            let creep = Game.creeps[name];
            let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
            let count = harvesters.length;
            creep.memory.working = false;
        }
    }
    /** @param {Creep} creep **/
    ,run: function(creep) {
        if(creep.store.getFreeCapacity() > 0) {
            let sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00'}});
            }
            console.log(creep.name + ' is moving...');
        } else {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePath: { stroke: '#ffffff'}});
                }
            }
            console.log(creep.name + ' is moving to energy source...')
        }
    }
};

module.exports = roleHarvester;