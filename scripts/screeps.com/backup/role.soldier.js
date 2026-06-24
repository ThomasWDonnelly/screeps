/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.soldier');
 * mod.thing == 'a thing'; // true
 */
let roleSoldier = {
    /** @param {Creep} creep **/
    run: function (creep) {
        // 0. Retreat if critical (Coordinate with Tower/Medic)
        if (creep.hits < creep.hitsMax * 0.4) {
            let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            if (spawn) {
                creep.moveTo(spawn, {visualizePathStyle: {stroke: '#00ff00'}});
                creep.say('💔 retreat');
                return;
            }
        }

        // 1. Attack closest hostile creep
        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(target) {
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
            }
            return;
        }
        
        // 2. Attack closest hostile structure
        let hostileStructure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
        if(hostileStructure) {
            if(creep.attack(hostileStructure) == ERR_NOT_IN_RANGE) {
                creep.moveTo(hostileStructure, {visualizePathStyle: {stroke: '#ff0000'}});
            }
            return;
        }
        
        // 3. Move to 'Attack' flag if defined (Manual Aggression)
        let flag = Game.flags['Attack'];
        if(flag) {
            if(!creep.pos.inRangeTo(flag, 3)) {
                creep.moveTo(flag, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        } else {
            // 4. Patrol Path (Flags named Patrol1, Patrol2, etc.)
            let patrolFlags = Object.keys(Game.flags).filter(n => n.startsWith('Patrol')).sort();
            
            if (patrolFlags.length > 0) {
                if (creep.memory.patrolIndex === undefined || creep.memory.patrolIndex >= patrolFlags.length) {
                    creep.memory.patrolIndex = 0;
                }
                let targetFlag = Game.flags[patrolFlags[creep.memory.patrolIndex]];
                if (targetFlag) {
                    if (creep.pos.inRangeTo(targetFlag, 2)) {
                        creep.memory.patrolIndex = (creep.memory.patrolIndex + 1) % patrolFlags.length;
                    } else {
                        creep.moveTo(targetFlag, {visualizePathStyle: {stroke: '#0000ff'}});
                    }
                }
            } else {
                // 5. Patrol near Spawn (Fallback)
                let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                if (spawn && creep.pos.getRangeTo(spawn) > 5) {
                    creep.moveTo(spawn, {visualizePathStyle: {stroke: '#0000ff'}});
                }
            }
        }
     }
};

module.exports = roleSoldier;