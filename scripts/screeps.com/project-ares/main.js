let roleBuilder = require('role.builder');
let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleRepairer = require('role.repairer');
let roleSoldier = require('role.soldier');
let roleMedic = require('role.medic');
let roleMiner = require('role.miner');
let roleHauler = require('role.hauler');
let rolePowerCreep = require('role.powerCreep');
let roleScout = require('role.scout');
let roleDemolisher = require('role.demolisher');
let roleDismantler = require('role.dismantler');
let roleDistributor = require('role.distributor');
let roleClaimer = require('role.claimer');
let roleBigClaimer = require('role.bigClaimer');
let roleWallRepairer = require('role.wallRepairer');
let roleRemoteMiner = require('role.remoteMiner');
let roleRemoteBuilder = require('role.remoteBuilder');
let roleRemoteHauler = require('role.remoteHauler');
let roleRemoteHarvester = require('role.remoteHarvester');
let roleRemoteStationaryHarvester = require('role.remoteStationaryHarvester');
let roleRemoteReserver = require('role.remoteReserver');
let roleRemoteGuard = require('role.remoteGuard');
let roleRemoteManager = require('role.remoteManager');
let roleRemoteScout = require('role.remoteScout');
let roleEnergyHauler = require('role.energyHauler');
let roleTerminalManager = require('role.terminalManager');
let roleLabManager = require('role.labManager');
let roleFactoryManager = require('role.factoryManager');
let roleNukeManager = require('role.nukeManager');
let roleMarketManager = require('role.marketManager');
let roleBoostManager = require('role.boostManager');
let rolePortalScout = require('role.portalScout');
let rolePowerHarvester = require('role.powerHarvester');
let rolePowerAttacker = require('role.powerAttacker');
let roleDepositMiner = require('role.depositMiner');
let roleTactical = require('role.tactical');
let roleCommander = require('role.commander');
let squadManager = require('squadManager');
let tacticPhalanx = require('tactic.phalanx');
let tacticGuard = require('tactic.guard');
let tacticRetaliation = require('tactic.retaliation');
let tacticScout = require('tactic.scout');
let nameRegistry = require('registryOfNames');
let spawnManager = require('manager.spawn');
let roleMortician = require('role.mortician');
let roleCoroner = require('role.coroner');
let roleNecromancer = require('role.necromancer');
let roleArchaeologist = require('role.archaeologist');
let diplomacyManager = require('diplomacy');
let roleTowerManager = require('role.towerManager');
let roleConstructionManager = require('role.constructionManager');
let roleLinkManager = require('role.linkManager');

require('require');
global.config = require('config');
require('logging');
require('prototype.creep');

const roleModules = {
    'builder': roleBuilder,
    'harvester': roleHarvester,
    'upgrader': roleUpgrader,
    'repairer': roleRepairer,
    'wallRepairer': roleWallRepairer,
    'soldier': roleSoldier,
    'medic': roleMedic,
    'miner': roleMiner,
    'hauler': roleHauler,
    'scout': roleScout,
    'demolisher': roleDemolisher,
    'dismantler': roleDismantler,
    'distributor': roleDistributor,
    'claimer': roleClaimer,
    'bigClaimer': roleBigClaimer,
    'remoteMiner': roleRemoteMiner,
    'remoteBuilder': roleRemoteBuilder,
    'remoteHauler': roleRemoteHauler,
    'remoteHarvester': roleRemoteHarvester,
    'remoteStationaryHarvester': roleRemoteStationaryHarvester,
    'remoteReserver': roleRemoteReserver,
    'remoteGuard': roleRemoteGuard,
    'remoteManager': roleRemoteManager,
    'remoteScout': roleRemoteScout,
    'energyHauler': roleEnergyHauler,
    'labManager': roleLabManager,
    'factoryManager': roleFactoryManager,
    'nukeManager': roleNukeManager,
    'boostManager': roleBoostManager,
    'portalScout': rolePortalScout,
    'powerHarvester': rolePowerHarvester,
    'powerAttacker': rolePowerAttacker,
    'depositMiner': roleDepositMiner,
    'tactical': roleTactical,
    'commander': roleCommander,
    'necromancer': roleNecromancer,
    'archaeologist': roleArchaeologist
};

// Global command for setting player status from the console
global.setPlayerStatus = function (username, status) {
    return diplomacyManager.setStatus(username, status);
};

module.exports.loop = function () {
    // "Bring Out Your Dead" - The Mortician handles dead creep memory
    roleMortician.run();

    // Run Diplomacy Manager to track friends and foes
    diplomacyManager.run();

    // Run Coroner Report periodically
    if (Game.time % 5000 === 0) {
        roleCoroner.run();
    }

    // Efficiently count creeps by role
    const roleCounts = _.countBy(Game.creeps, c => c.memory.role);

    // Periodically log creep counts instead of every tick
    if (Game.time % 20 === 0) {
        console.log("--- Creep Report ---");
        for (const role in roleCounts) {
            console.log(`${role}: ${roleCounts[role]}`);
        }
    }

    //#region Information
    // Get the available energy in the room
    let spawn = Game.spawns['Spawn1'] || Object.values(Game.spawns)[0];

    // Auto-Place Patrol Flags
    if (spawn) {
        let patrolFlags = _.filter(Game.flags, (f) => f.name.startsWith('Patrol'));
        if (patrolFlags.length === 0) {
            console.log("Initializing Patrol Perimeter...");
            let r = 10; // Radius
            // 8 points around the spawn (Clockwise starting Top-Left)
            let points = [
                { x: -r, y: -r }, { x: 0, y: -r }, { x: r, y: -r },
                { x: r, y: 0 },
                { x: r, y: r }, { x: 0, y: r }, { x: -r, y: r },
                { x: -r, y: 0 }
            ];

            for (let i = 0; i < points.length; i++) {
                let flagName = 'Patrol' + (i + 1);
                let newX = Math.max(2, Math.min(47, spawn.pos.x + points[i].x));
                let newY = Math.max(2, Math.min(47, spawn.pos.y + points[i].y));
                spawn.room.createFlag(newX, newY, flagName, COLOR_BLUE);
            }
        }
    }

    // Auto-Remove Claim Flag
    if (Game.flags['Claim']) {
        let flag = Game.flags['Claim'];
        if (flag.room && flag.room.controller && flag.room.controller.my) {
            console.log('Room ' + flag.room.name + ' successfully claimed. Removing Claim flag.');
            flag.remove();
        }
    }
    //#endregion

    //#region Construction Manager
    for (let name in Game.rooms) {
        let room = Game.rooms[name];
        if (room.controller && room.controller.my) {
            roleConstructionManager.run(room);
        }
    }
    //#endregion

    //#region Link System
    // (Transfer Energy from Source to Controller/Storage)
    for (let name in Game.rooms) {
        let room = Game.rooms[name];
        if (room.controller && room.controller.my) {
            roleLinkManager.run(room);
        }
    }
    //#endregion

    //#region Terminal Manager
    // (Resource Balancing)
    roleTerminalManager.run();
    //#endregion

    //#region Market Manager
    // (Selling Excess)
    roleMarketManager.run();
    //#endregion

    //#region Boost Manager
    // (Boosting Creeps)
    if (spawn) {
        roleBoostManager.boostCreeps(spawn.room);
    }
    //#endregion

    //#region Lab Manager
    // (Reactions)
    if (spawn) {
        // Auto-set targetReaction if missing
        if (!spawn.room.memory.targetReaction) {
            spawn.room.memory.targetReaction = 'OH'; // Default base reaction
            console.log(`[LabManager] Auto-setting targetReaction to 'OH' for ${spawn.room.name}`);
        }
        roleLabManager.runLabs(spawn.room);
    }
    //#endregion

    //#region Factory Manager
    if (spawn) {
        roleFactoryManager.runFactory(spawn.room);
    }
    //#endregion

    //#region Squad Manager
    if (spawn) {
        squadManager.run(spawn.room);
    }
    //#endregion

    //#region Spawn Manager
    if (spawn) {
        spawnManager.run(spawn, roleCounts);

        let powerSpawn = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_POWER_SPAWN }
        })[0];
        if (powerSpawn) {
            powerSpawn.processPower();
        }
    }
    //#endregion

    //#region Tower Manager
    // Run Tower Manager for all rooms with a controller
    for (let name in Game.rooms) {
        let room = Game.rooms[name];
        if (room.controller && room.controller.my) {
            roleTowerManager.run(room);
        }
    }
    //#endregion

    //#region Creep Role Execution
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        const roleModule = roleModules[creep.memory.role];
        if (roleModule) {
            roleModule.run(creep);
        } else {
            console.log(`Error: No role module found for creep ${creep.name} with role ${creep.memory.role}`);
        }
    }
    //#endregion

    //#region Run Power Creeps
    for (let name in Game.powerCreeps) {
        let creep = Game.powerCreeps[name];
        if (!creep.room) {
            // Auto-Spawn in the first room with a Power Spawn
            let spawnRoom = Object.values(Game.rooms).find(r => r.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_POWER_SPAWN } }).length > 0);
            if (spawnRoom) {
                let powerSpawn = spawnRoom.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_POWER_SPAWN } })[0];
                creep.spawn(powerSpawn);
            }
        } else {
            rolePowerCreep.run(creep);
        }
    }
    //#endregion
};