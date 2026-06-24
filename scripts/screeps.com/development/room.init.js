/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('room.init');
 * mod.thing == 'a thing'; // true
 */
let roomInit = {
    checkAvailableEnergy: function (Game) {
        // check the rooms available energy
        for (let room in Game.rooms) {
            console.log('Room "' + room + '" has ' + Game.rooms[name].energyAvailable + ' energy');
        }
    }
    , clearCreepMemory: function (Memory) {
        // clearing creeps memory of any dead
        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing the dead from memory, R.I.P. ', name);
            }
        }
    }
    , colonyProperties: function () {
        //TODO: Declare creep properties
        console.log('"roomInit.colonyProperties()" is not yet implemented');
    }
    , primarySpawn: function () {
        //TODO: Pick Spawn1's location
        console.log('"roomInit.primarySpawn()" is not yet implemented');
    }
}

module.exports = roomInit;