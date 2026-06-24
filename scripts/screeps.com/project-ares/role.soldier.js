/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.soldier');
 * mod.thing == 'a thing'; // true
 */
const diplomacyManager = require('diplomacy');

let roleSoldier = {
    /** @param {Creep} creep **/
    run: function (creep) {
        // 0. Retreat if critical (Coordinate with Tower/Medic)
        if (creep.hits < creep.hitsMax * global.config.settings.soldierRetreatHealth) {
            let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            if (spawn) {
                creep.moveToTarget(spawn, '#00ff00');
                creep.say('💔 retreat');
                return;
            }
        }

        // 0.5. Get Boosted if requested
        if (creep.memory.needBoost && !creep.spawning) {
            let config = creep.room.memory.boostConfig;
            if (config && config.labId) {
                let lab = Game.getObjectById(config.labId);
                if (lab) {
                    if (!creep.pos.inRangeTo(lab, 1)) {
                        creep.moveToTarget(lab, '#ffffff');
                        return;
                    }
                    // Wait for boost. Check if boosted to clear flag.
                    if (creep.body.some(b => b.boost)) {
                        creep.memory.needBoost = false;
                        creep.say('💪 boosted');
                    } else {
                        creep.say('🧪 waiting');
                        return;
                    }
                }
            }
        }

        // 1. Attack closest hostile creep
        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
            filter: (c) => diplomacyManager.getStatus(c.owner.username) !== 'ally'
        });
        if (target) {
            creep.room.debugLog('combat', 'Soldier ' + creep.name + ' engaging hostile ' + target.name + ' at ' + target.pos);
            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveToTarget(target, '#ff0000');
            }
            return;
        }

        // 2. Attack closest hostile structure
        let hostileStructure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: (s) => s.owner && diplomacyManager.getStatus(s.owner.username) !== 'ally'
        });
        if (hostileStructure) {
            creep.room.debugLog('combat', 'Soldier ' + creep.name + ' engaging structure ' + hostileStructure.structureType + ' at ' + hostileStructure.pos);
            if (creep.attack(hostileStructure) == ERR_NOT_IN_RANGE) {
                creep.moveToTarget(hostileStructure, '#ff0000');
            }
            return;
        }

        // 3. Move to 'Attack' flag if defined (Manual Aggression)
        let flag = Game.flags['Attack'];
        if (flag) {
            if (!creep.pos.inRangeTo(flag, 3)) {
                creep.moveToTarget(flag, '#ff0000');
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
                        creep.moveToTarget(targetFlag, '#0000ff');
                    }
                }
            } else {
                // 5. Patrol near Spawn (Fallback)
                let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                if (spawn && creep.pos.getRangeTo(spawn) > 5) {
                    creep.moveToTarget(spawn, '#0000ff');
                }
            }
        }
    }
};

module.exports = roleSoldier;