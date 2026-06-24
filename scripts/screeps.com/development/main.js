//let roomInit = require('room.init');
let builder = require('role.builder');
let harvester = require('role.harvester');
let upgrader = require('role.upgrader');

let gameObj = Game;
let currentTick = Game.time;
let spawn = Game.spawns.Spawn1;

let builderCount = 0;
let harvesterCount = 0;
let upgraderCount = 0;

module.exports.loop = function () {
    console.log('Starting tick: ', `${currentTick}...`);
    
    //#region Init
    //// TODO: Move logic to room.init.js

    // Check for any "dead" Creeps in memory
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            // Deleting "dead" creeps from memory
            delete Memory.creeps[name];
            console.log('Clearing the dead from memory, R.I.P. ', {name});
        }
    }

    console.log('RoomsObj: ', Game.rooms);
    // Display the rooms available energy
    for (let name in Game.rooms) {
        console.log(`Room "${name}" has ${Game.rooms[name].energyAvailable} energy`);
    }
    
    // Get creep counts in console
    let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Builders: ', builders.length);
    
    let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ', harvesters.length);

    let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ', upgraders.length);

    // Auto-Spawn initial creeps
    //// TODO: Refactor `spawn.createCreep()` to use `StructureSpawn.spawnCreep()`
    if (harvesterCount <= 3) {
        spawn.createCreep([WORK, CARRY, MOVE, MOVE, MOVE, MOVE], undefined, { role: 'harvester', working: false });
    } else if (upgraderCount <= 3) {
        spawn.createCreep([WORK, CARRY, MOVE, MOVE, MOVE, MOVE], undefined, { role: 'upgrader', working: false });
    } else if (builderCount <= 3) {
        spawn.createCreep([WORK, CARRY, MOVE, MOVE, MOVE, MOVE], undefined, { role: 'builder', working: false });
    }
    //#endregion

    // Execute creep behavior
    for (let name in Game.creeps) {
        // Selecting Creep
        let creep = Game.creeps[name];
        // Executing selected creeps role
        if (creep.memory.role == 'harvester') {
            harvester.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            upgrader.run(creep);
        }
        if (creep.memory.role == 'builder') {
            builder.run(creep);
        }
    }

    console.log('End of tick: ',`${currentTick}...`);
}();