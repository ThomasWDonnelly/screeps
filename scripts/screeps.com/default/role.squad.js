/*
 * This module contains the logic for a creep that is part of a squad.
 * It reads the squad's state from memory and acts accordingly.
 */
const roleSquad = {

    /** @param {Creep} creep **/
    run: function (creep) {
        const squadName = creep.memory.squad;
        if (!squadName || !Memory.squads || !Memory.squads[squadName]) {
            // This creep is not in a valid squad, maybe it should fall back to solo behavior.
            creep.say('No Squad!');
            delete creep.memory.squad;
            return false; // Indicates that squad logic did not run.
        }

        const squad = Memory.squads[squadName];
        const flag = Game.flags[squad.flagName];

        if (!flag) {
            creep.say('No Flag!');
            return true; // Squad logic ran, but there's nothing to do.
        }

        switch (squad.state) {
            case 'attacking':
                this.runAttack(creep, squad, flag);
                break;
            case 'rallying':
            default:
                this.runRally(creep, squad, flag);
                break;
        }
        return true; // Indicates squad logic has run.
    },

    runAttack: function (creep, squad, flag) {
        // Specific logic for different roles within the squad
        if (creep.memory.role === 'medic') {
            const damagedComrade = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: c => c.memory.squad === squad.name && c.hits < c.hitsMax
            });
            if (damagedComrade) {
                if (creep.heal(damagedComrade) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(damagedComrade, { visualizePathStyle: { stroke: '#00ff00' } });
                }
                return;
            }
        }

        // Generic attack logic for soldiers
        const target = flag.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
            }
        } else {
            creep.moveTo(flag, { visualizePathStyle: { stroke: '#cccccc' } });
        }
    },

    runRally: function (creep, squad, flag) {
        if (!creep.pos.inRangeTo(flag, 3)) {
            creep.moveTo(flag, { visualizePathStyle: { stroke: '#ffffff' } });
        }
        creep.say('Rallying!');
    }
};

module.exports = roleSquad;