/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.energyHauler');
 * mod.thing == 'a thing'; // true
 */
var roleEnergyHauler = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(!creep.memory.hauling && creep.store.getFreeCapacity() == 0) {
            creep.memory.hauling = true;
            creep.say('🚚 deliver');
        }
        if(creep.memory.hauling && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.hauling = false;
            creep.say('🔄 collect');
        }

        // Repair roads under creep
        var road = creep.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType == STRUCTURE_ROAD && s.hits < s.hitsMax);
        if(road && creep.store[RESOURCE_ENERGY] > 0) {
            creep.repair(road);
        }

        if(creep.memory.hauling) {
            var spawn = Game.spawns['Spawn1'] || Object.values(Game.spawns)[0];
            if(spawn) {
                if(creep.room.name !== spawn.room.name) {
                    creep.moveTo(spawn.pos, {visualizePathStyle: {stroke: '#ffffff'}});
                } else {
                    var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (s) => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_STORAGE) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    });
                    if(target) {
                        if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                }
            }
        } else {
            var flag = Game.flags['Remote'];
            if(flag) {
                if(creep.room.name !== flag.pos.roomName) {
                    creep.moveTo(flag, {visualizePathStyle: {stroke: '#ffaa00'}});
                } else {
                    const dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, { filter: (r) => r.resourceType == RESOURCE_ENERGY });
                    if(dropped) {
                        if(creep.pickup(dropped) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(dropped, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                    } else {
                        const container = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0 });
                        if(container) {
                            if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                            }
                        }
                    }
                }
            }
        }
    }
};
module.exports = roleEnergyHauler;