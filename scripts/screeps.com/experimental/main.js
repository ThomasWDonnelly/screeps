// import modules
require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');

module.exports.loop = function () {
    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // check if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the creep
            delete Memory.creeps[name];
        }
    }

    // for each of the existing creeps
    for (let name in Game.creeps) {
        // run creep logic
        Game.creeps[name].runRole();
    }

    // find all towers in room
    let towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    // for each tower found
    for (let tower of towers) {
        // run tower logic
        tower.defend();
    }

    // for each spawn point found
    for (let spawnName in Game.spawns) {
        // run spawn logic
        Game.spawns[spawnName].spawnCreepsIfNecessary();
    }
};