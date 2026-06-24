/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.remoteMiner');
 * mod.thing == 'a thing'; // true
 */
var roleRemoteMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var flag = Game.flags['Remote'];
        
        if(flag) {
            // 1. Move to Target Room
            if(creep.room.name != flag.pos.roomName) {
                creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffaa00'}});
                return;
            }
            
            // 2. Find Source in Target Room
            var sources = creep.room.find(FIND_SOURCES);
            var source = creep.pos.findClosestByPath(sources, {
                filter: (s) => s.pos.findInRange(FIND_CREEPS, 1, {
                    filter: (c) => c.memory.role == 'remoteMiner' && c.id !== creep.id
                }).length == 0
            });

            if(!source) source = creep.pos.findClosestByPath(sources);

            if(source) {
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                } else {
                    // 3. Drop or Transfer
                    if (creep.store.getFreeCapacity() === 0) {
                        let container = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: {structureType: STRUCTURE_CONTAINER}})[0];
                        if(container && container.store.getFreeCapacity() > 0) {
                            creep.transfer(container, RESOURCE_ENERGY);
                        } else {
                            creep.drop(RESOURCE_ENERGY);
                        }
                    }
                }
            }
        }
    }
};

module.exports = roleRemoteMiner;