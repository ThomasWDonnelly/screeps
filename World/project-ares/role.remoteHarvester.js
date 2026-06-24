/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.remoteHarvester');
 * mod.thing == 'a thing'; // true
 */
var roleRemoteHarvester = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var flag = Game.flags['Remote'];
        if(flag) {
            if(creep.room.name !== flag.pos.roomName) {
                creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffaa00'}});
                return;
            }
            
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if(source) {
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                } else {
                    if(creep.store.getFreeCapacity() == 0) {
                        var link = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (s) => s.structureType == STRUCTURE_LINK && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                        });
                        if(link) {
                            creep.transfer(link, RESOURCE_ENERGY);
                        } else {
                            var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                                filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                            });
                            if(container) {
                                creep.transfer(container, RESOURCE_ENERGY);
                            } else {
                                creep.drop(RESOURCE_ENERGY);
                            }
                        }
                    }
                }
            }
        }
    }
};
module.exports = roleRemoteHarvester;