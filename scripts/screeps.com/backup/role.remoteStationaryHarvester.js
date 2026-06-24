/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.remoteStationaryHarvester');
 * mod.thing == 'a thing'; // true
 */
var roleRemoteStationaryHarvester = {
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
                if(!creep.pos.inRangeTo(source, 1)) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                } else {
                    var container = creep.pos.findInRange(FIND_STRUCTURES, 0, { filter: { structureType: STRUCTURE_CONTAINER } });
                    var site = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 0, { filter: { structureType: STRUCTURE_CONTAINER } });
                    
                    if(container.length == 0 && site.length == 0) {
                        creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                    }
                    
                    if(creep.harvest(source) == OK) {
                        if(site.length > 0 && creep.store[RESOURCE_ENERGY] > 0) {
                            creep.build(site[0]);
                        }
                    }
                }
            }
        }
    }
};
module.exports = roleRemoteStationaryHarvester;