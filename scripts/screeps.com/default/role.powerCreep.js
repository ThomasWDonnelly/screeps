/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.powerCreep');
 * mod.thing == 'a thing'; // true
 */
var rolePowerCreep = {

    /** @param {PowerCreep} creep **/
    run: function(creep) {
        // 1. Renew if getting old (Power Creeps die after 5000 ticks if not renewed)
        if(creep.ticksToLive < 1000) {
            let powerSpawn = creep.room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_POWER_SPAWN }
            })[0];
            
            if(powerSpawn) {
                if(creep.renew(powerSpawn) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(powerSpawn, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                return;
            }
        }

        // 2. Enable Power on Controller (Required to use powers in the room)
        if(creep.room.controller && !creep.room.controller.isPowerEnabled) {
            if(creep.enableRoom(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            return;
        }

        // 3. Use Abilities (Example: Generate Ops)
        if(creep.powers[PWR_GENERATE_OPS] && creep.powers[PWR_GENERATE_OPS].cooldown == 0) {
            creep.usePower(PWR_GENERATE_OPS);
        }
    }
};

module.exports = rolePowerCreep;