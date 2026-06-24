let tacticPhalanx = require('tactic.phalanx');
let tacticGuard = require('tactic.guard');
let tacticRetaliation = require('tactic.retaliation');
let tacticScout = require('tactic.scout');

module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // Determine Tactic
        let currentTactic = 'guard';

        if (creep.memory.tacticOverride) {
            currentTactic = creep.memory.tacticOverride;
        } else if (Game.flags['Retaliate'] && creep.room.name !== Game.flags['Retaliate'].pos.roomName) {
            currentTactic = 'retaliation';
        } else if (Game.flags['Explore'] && !creep.memory.squadId) {
            currentTactic = 'scout';
        } else if (creep.memory.squadId) {
            currentTactic = 'phalanx';
        }

        creep.memory.currentTactic = currentTactic; 
        
        switch (currentTactic) {
            case 'phalanx':
                tacticPhalanx.run(creep);
                break;
            case 'retaliation':
                tacticRetaliation.run(creep);
                break;
            case 'scout':
                tacticScout.run(creep);
                break;
            default:
                tacticGuard.run(creep);
                break;
        }
    }
};