/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.medic');
 * mod.thing == 'a thing'; // true
 */
let roleSquad = require('role.squad');

let roleMedic = {

    /** @param {Creep} creep **/
    run: function (creep) {
        // If creep is in a squad, run squad logic and exit.
        if (creep.memory.squad) {
            if (roleSquad.run(creep)) return;
        }

        const target = creep.pos.findClosestByRange(FIND_MY_CREEPS, { // SOLO LOGIC
            filter: function (object) {
                return object.hits < object.hitsMax;
            }
        });
        if (target) {
            if (creep.heal(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#00ff00' } });
            }
        } else {
            const soldier = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: (c) => c.memory.role == 'soldier'
            });
            if (soldier) {
                creep.moveTo(soldier, { visualizePathStyle: { stroke: '#00ff00' } });
            }
        }
    }
};

module.exports = roleMedic;