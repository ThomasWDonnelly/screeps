let builder = require('role.builder');
let harvester = require('role.harvester');
let upgrader = require('role.upgrader');

let currentTick = Game.time;
let spawn = Game.spawns.Spawn1;
let builderCount = 0;
let harvesterCount = 0;
let upgraderCount = 0;

module.exports.loop = function() {
    console.log('Start of loop ' +currentTick+ '...');
    //#region Init
    ////TODO: Move logic to room.init.js

    // Clear the "dead" Creeps from memory
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    // Display the rooms available energy
    for(let name in Game.rooms) {
        console.log('Room "'+name+'" has '+Game.rooms[name].energyAvailable+' energy');
    }

    // Get creep counts in console
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        
        let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        
        builderCount = builders.length;
        harvesterCount = harvesters.length;
        upgraderCount = upgraders.length;

        console.log('Builders: ' + builderCount);
        console.log('Harvesters: ' + harvesterCount);
        console.log('Upgraders: ' + upgraderCount);
    }

    // Auto-Spawn initial creeps
    if (harvesterCount <= 3) {
        spawn.spawnCreep([WORK, CARRY, MOVE, MOVE, MOVE], undefined, {role: 'harvester', working: false});
    } else if (upgraderCount <= 3) {
        spawn.spawnCreep([WORK, CARRY, MOVE, MOVE, MOVE], undefined, {role: 'upgrader', working: false});
    } else if (builderCount <= 3) {
        spawn.spawnCreep([WORK, CARRY, MOVE, MOVE, MOVE], undefined, {role: 'builder', working: false});
    }
    //#endregion

    for (let name in Game.creeps) {
        let creep = Game.creeps[name];

        // Executing Roles
        if (creep.memory.role == 'harvester') {
            harvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            upgrader.run(creep);
        }
        if (creep.memory.role == 'builder') {
            builder.run(creep);
        }
    }
    console.log('End of loop ' +currentTick+ '...');
}