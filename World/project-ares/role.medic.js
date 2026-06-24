/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.medic');
 * mod.thing == 'a thing'; // true
 */
let roleMedic = {
    
    /** @param {Creep} creep **/
    run: function (creep) {
        // 0. Retreat if critical
        if (creep.hits < creep.hitsMax * global.config.settings.medicRetreatHealth) {
            let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            if (spawn) {
                creep.moveToTarget(spawn, '#00ff00');
                creep.say('💔 retreat');
                return;
            }
        }

        const target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: function(object) {
                return object.hits < object.hitsMax;
            }
        });
        if(target) {
            if(creep.heal(target) == ERR_NOT_IN_RANGE) {
                creep.moveToTarget(target, '#00ff00');
            }
        } else {
            const soldier = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: (c) => c.memory.role == 'soldier'
            });
            if(soldier) {
                creep.moveToTarget(soldier, '#00ff00');
            }
        }
    }
};

module.exports = roleMedic;