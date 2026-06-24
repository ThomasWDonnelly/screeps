/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('room.init.js');
 * mod.thing == 'a thing'; // true
 */

let roomInit = {
    availableEnergy: function() {
        // Display the rooms available energy
        for(let name in Game.rooms) {
            console.log(`Room "${name}" has ${Game.rooms[name].energyAvailable} energy available for use.`);
        }
    }
    /** @param {Memory} Memory **/
    ,cleanMemory: function(Memory) {
        for(let name in Memory.creeps){
            if(!Game.creeps[name]) {
                console.log(`Thank you for your service ${name}, R.I.P`);
                delete Memory.creeps[name];
            }
        }
        return console.log(`Cleared the dead from Memory`);
    }
    ,colony: function() {}
    ,primarySpawn: function() {}
};

module.exports = roomInit;