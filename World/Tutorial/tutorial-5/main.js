var roleBuilder = require('role.builder');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function () {
    
    // Clear the "dead" Creeps from memory
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    // Get the available energy in the room
    for(let name in Game.rooms) {
        console.log('Room "'+name+'" has '+Game.rooms[name].energyAvailable+' energy');
    }
    
    // Get creep counts in console
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Builders: ' + builders.length);
    
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ' + upgraders.length);

    // Auto-Spawn Creeps if less than n
    if (harvesters.length < 2) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
            {memory: {role: 'harvester'}});
    }
    
    if (builders.length < 2) {
        var newName = 'Builder' + Game.time;
        console.log('Spawning new builder: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
            {memory: { role: 'builder' } });
    }
    
    if (upgraders.length < 2) {
        var newName = 'Upgrader' + Game.time;
        console.log('Spawning new upgrader: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
            { memory: { role: 'upgrader' } });
    }
    
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }
    
    // if(Game.spawns['Spawn2'].spawning) { 
    //     var spawningCreep = Game.creeps[Game.spawns['Spawn2'].spawning.name];
    //     Game.spawns['Spawn2'].room.visual.text(
    //         '🛠️' + spawningCreep.memory.role,
    //         Game.spawns['Spawn2'].pos.x + 1, 
    //         Game.spawns['Spawn2'].pos.y, 
    //         {align: 'left', opacity: 0.8});
    // }
    
    // if(Game.spawns['Spawn3'].spawning) { 
    //     var spawningCreep = Game.creeps[Game.spawns['Spawn3'].spawning.name];
    //     Game.spawns['Spawn3'].room.visual.text(
    //         '🛠️' + spawningCreep.memory.role,
    //         Game.spawns['Spawn3'].pos.x + 1, 
    //         Game.spawns['Spawn3'].pos.y, 
    //         {align: 'left', opacity: 0.8});
    // }

    // Attack Closest Hostile with Tower
    var tower = Game.getObjectById('95dbba933909e698e47d9f47');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
        
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }
    
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
    }
}