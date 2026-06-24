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
        creep.checkEnergyState('hauling', '🚚 deliver', '🔄 collect');

        // Repair roads under creep
        var road = creep.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType == STRUCTURE_ROAD && s.hits < s.hitsMax);
        if(road && creep.store[RESOURCE_ENERGY] > 0) {
            creep.repair(road);
        }

        if(creep.memory.hauling) {
            var spawn = Game.spawns['Spawn1'] || Object.values(Game.spawns)[0];
            if(spawn) {
                if(creep.room.name !== spawn.room.name) {
                    creep.moveToTarget(spawn.pos, '#ffffff');
                } else {
                    var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (s) => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_STORAGE) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    });
                    if(target) {
                        if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveToTarget(target, '#ffffff');
                        }
                    }
                }
            }
        } else {
            var flag = Game.flags['Remote'];
            if(flag) {
                if(creep.room.name !== flag.pos.roomName) {
                    creep.moveToTarget(flag, '#ffaa00');
                } else {
                    const dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, { filter: (r) => r.resourceType == RESOURCE_ENERGY });
                    if(dropped) {
                        if(creep.pickup(dropped) == ERR_NOT_IN_RANGE) {
                            creep.moveToTarget(dropped, '#ffaa00');
                        }
                    } else {
                        const container = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0 });
                        if(container) {
                            if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveToTarget(container, '#ffaa00');
                            }
                        }
                    }
                }
            }
        }
    }
};
module.exports = roleEnergyHauler;