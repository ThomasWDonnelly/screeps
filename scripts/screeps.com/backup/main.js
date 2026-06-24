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
let roleEnergyHauler = require('role.energyHauler');

module.exports.loop = function () {
    //#region Information
    // Clear the "dead" Creeps from memory
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    //#region Get the available energy in the room
    for (let name in Game.rooms) {
        console.log('Room "' + name + '" has ' + Game.rooms[name].energyAvailable + ' energy');
    }
    //#endregion

    let spawn = Game.spawns['Spawn1'] || Object.values(Game.spawns)[0];

    //#region Auto-Place Patrol Flags
    // if (spawn) {
    //     let patrolFlags = _.filter(Game.flags, (f) => f.name.startsWith('Patrol'));
    //     if (patrolFlags.length === 0) {
    //         console.log("Initializing Patrol Perimeter...");
    //         let r = 10; // Radius
    //         // 8 points around the spawn (Clockwise starting Top-Left)
    //         let points = [
    //             { x: -r, y: -r }, { x: 0, y: -r }, { x: r, y: -r },
    //             { x: r, y: 0 },
    //             { x: r, y: r }, { x: 0, y: r }, { x: -r, y: r },
    //             { x: -r, y: 0 }
    //         ];

    //         for (let i = 0; i < points.length; i++) {
    //             let flagName = 'Patrol' + (i + 1);
    //             let newX = Math.max(2, Math.min(47, spawn.pos.x + points[i].x));
    //             let newY = Math.max(2, Math.min(47, spawn.pos.y + points[i].y));
    //             spawn.room.createFlag(newX, newY, flagName, COLOR_BLUE);
    //         }
    //     }
    // }
    //#endregion

    //#region Auto-Build Roads
    //#region Auto-Build Roads to Sources
    if (spawn && spawn.room.find(FIND_CONSTRUCTION_SITES).length == 0) {
        let sources = spawn.room.find(FIND_SOURCES);
        if (sources.length > 0) {
            let path = spawn.pos.findPathTo(sources[0], { ignoreCreeps: true });
            if (path.length > 0) {
                let midPoint = path[Math.floor(path.length / 2)];
                spawn.room.createConstructionSite(midPoint.x, midPoint.y, STRUCTURE_ROAD);
            }
        }
    }
    //#endregion

    //#region Auto-Build Roads to Controller (Check every 1000 ticks)
    if (spawn && Game.time % 1000 === 0) {
        let path = spawn.pos.findPathTo(spawn.room.controller, { ignoreCreeps: true });
        for (let i = 0; i < path.length; i++) {
            spawn.room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
        }
    }
    //#endregion
    //#endregion

    //#region Get creep counts in console
    let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Builders: ' + builders.length);

    let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    let miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
    console.log('Miners: ' + miners.length);

    let haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    console.log('Haulers: ' + haulers.length);

    let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ' + upgraders.length);

    let repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    console.log('Repairers: ' + repairers.length);

    let wallRepairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'wallRepairer');
    console.log('WallRepairers: ' + wallRepairers.length);

    let soldiers = _.filter(Game.creeps, (creep) => creep.memory.role == 'soldier');
    console.log('Soldiers: ' + soldiers.length);

    let medics = _.filter(Game.creeps, (creep) => creep.memory.role == 'medic');
    console.log('Medics: ' + medics.length);

    let demolishers = _.filter(Game.creeps, (creep) => creep.memory.role == 'demolisher');
    console.log('Demolishers: ' + demolishers.length);

    let dismantlers = _.filter(Game.creeps, (creep) => creep.memory.role == 'dismantler');
    console.log('Dismantlers: ' + dismantlers.length);

    let distributors = _.filter(Game.creeps, (creep) => creep.memory.role == 'distributor');
    console.log('Distributors: ' + distributors.length);

    let claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
    console.log('Claimers: ' + claimers.length);

    let bigClaimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'bigClaimer');
    console.log('BigClaimers: ' + bigClaimers.length);

    let remoteMiners = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteMiner');
    console.log('RemoteMiners: ' + remoteMiners.length);

    let remoteBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteBuilder');
    console.log('RemoteBuilders: ' + remoteBuilders.length);

    let remoteHaulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteHauler');
    console.log('RemoteHaulers: ' + remoteHaulers.length);

    let remoteHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteHarvester');
    console.log('RemoteHarvesters: ' + remoteHarvesters.length);

    let remoteStationaryHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteStationaryHarvester');
    console.log('RemoteStationaryHarvesters: ' + remoteStationaryHarvesters.length);

    let energyHaulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'energyHauler');
    console.log('EnergyHaulers: ' + energyHaulers.length);
    //#endregion

    //#region Auto-Build Extensions (Check every 100 ticks)
    if (spawn && Game.time % 100 === 0 && spawn.room.controller.level >= 2) {
        let extensions = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });
        let sites = spawn.room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });

        // If we have fewer extensions + sites than allowed by the current controller level
        if (extensions.length + sites.length < CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][spawn.room.controller.level]) {
            for (let x = -5; x <= 5; x++) {
                for (let y = -5; y <= 5; y++) {
                    let checkX = spawn.pos.x + x;
                    let checkY = spawn.pos.y + y;

                    // Checkerboard pattern (only build on even sum coordinates) to ensure paths
                    if ((x + y) % 2 !== 0) continue;

                    // Try to create construction site (returns OK if successful)
                    if (spawn.room.createConstructionSite(checkX, checkY, STRUCTURE_EXTENSION) === OK) {
                        // Break loops to place one at a time
                        x = 10; y = 10;
                    }
                }
            }
        }
    }
    //#endregion

    //#region Auto-Build Containers (Check every 500 ticks)
    if (spawn && Game.time % 500 === 0) {
        let sources = spawn.room.find(FIND_SOURCES);
        for (let source of sources) {
            // Check for existing container within range 1
            let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: { structureType: STRUCTURE_CONTAINER }
            });

            if (containers.length === 0) {
                // Check for construction site
                let sites = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                    filter: { structureType: STRUCTURE_CONTAINER }
                });

                if (sites.length === 0) {
                    // Try to build under a miner if one exists (perfect placement)
                    let miner = source.pos.findInRange(FIND_MY_CREEPS, 1, {
                        filter: (c) => c.memory.role == 'miner'
                    })[0];

                    if (miner) {
                        spawn.room.createConstructionSite(miner.pos, STRUCTURE_CONTAINER);
                    } else {
                        // Fallback: Calculate path from spawn and place container at the last step
                        let path = spawn.pos.findPathTo(source, { ignoreCreeps: true, range: 1 });
                        if (path.length > 0) {
                            let lastStep = path[path.length - 1];
                            spawn.room.createConstructionSite(lastStep.x, lastStep.y, STRUCTURE_CONTAINER);
                        }
                    }
                }
            }
        }
    }
    //#endregion

    //#region Auto-Build Extractor (Check every 1000 ticks)
    if (spawn && Game.time % 1000 === 0 && spawn.room.controller.level >= 6) {
        let minerals = spawn.room.find(FIND_MINERALS);
        for (let mineral of minerals) {
            let hasExtractor = mineral.pos.lookFor(LOOK_STRUCTURES).some(s => s.structureType == STRUCTURE_EXTRACTOR);
            let hasSite = mineral.pos.lookFor(LOOK_CONSTRUCTION_SITES).some(s => s.structureType == STRUCTURE_EXTRACTOR);

            if (!hasExtractor && !hasSite) {
                spawn.room.createConstructionSite(mineral.pos, STRUCTURE_EXTRACTOR);
            }
        }
    }
    //#endregion

    //#region Link System (Transfer Energy from Source to Controller/Storage)
    if (spawn && spawn.room.controller.level >= 5) {
        const links = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_LINK }
        });

        let sourceLinks = [];
        let targetLinks = [];

        for (let link of links) {
            // If link is near a source (range 2), it's a sender
            if (link.pos.findInRange(FIND_SOURCES, 2).length > 0) {
                sourceLinks.push(link);
            } else {
                targetLinks.push(link);
            }
        }

        for (let sourceLink of sourceLinks) {
            // If source link is full, transfer to a target link
            if (sourceLink.store.getUsedCapacity(RESOURCE_ENERGY) >= 700) {
                let target = targetLinks.find(l => l.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                if (target) {
                    sourceLink.transferEnergy(target);
                }
            }
        }
    }
    //#endregion

    //#region Auto-Spawn Creeps if less than n
    if (spawn && harvesters.length < 4) {
        let newName = getNerdyName();
        console.log('Spawning new harvester: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'harvester'), newName,
            { memory: { role: 'harvester' } });
    } else if (spawn && miners.length < 4) {
        let newName = getNerdyName();
        console.log('Spawning new miner: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'miner'), newName,
            { memory: { role: 'miner' } });
    } else if (spawn && haulers.length < 4 && miners.length > 0) {
        let newName = getNerdyName();
        console.log('Spawning new hauler: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'hauler'), newName,
            { memory: { role: 'hauler' } });
    } else if (spawn && upgraders.length < 4) {
        let newName = getNerdyName();
        console.log('Spawning new upgrader: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'upgrader'), newName,
            { memory: { role: 'upgrader' } });
    } else if (spawn && repairers.length < 2) {
        let newName = getNerdyName();
        console.log('Spawning new repairer: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'repairer'), newName,
            { memory: { role: 'repairer' } });
    } else if (spawn && wallRepairers.length < 1) {
        // Only spawn if there are walls/ramparts needing repair
        const targets = spawn.room.find(FIND_STRUCTURES, {
            filter: (object) => (object.structureType == STRUCTURE_WALL || object.structureType == STRUCTURE_RAMPART) && object.hits < 5000000
        });

        if (targets.length > 0) {
            let newName = getNerdyName();
            console.log('Spawning new wallRepairer: ' + newName);
            spawn.spawnCreep(getCreepBody(spawn.room, 'wallRepairer'), newName,
                { memory: { role: 'wallRepairer' } });
        }
    } else if (spawn && builders.length < 6 && spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
        let newName = getNerdyName();
        console.log('Spawning new builder: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'builder'), newName,
            { memory: { role: 'builder' } });
    } else if (spawn && soldiers.length < 3) {
        let newName = getNerdyName();
        console.log('Spawning new soldier: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'soldier'), newName,
            { memory: { role: 'soldier' } });
    } else if (spawn && medics.length < 4 && soldiers.length >= 2) {
        let newName = getNerdyName();
        console.log('Spawning new medic: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'medic'), newName,
            { memory: { role: 'medic' } });
    } else if (spawn && demolishers.length < 1 && Game.flags['Demolish']) {
        let newName = getNerdyName();
        console.log('Spawning new demolisher: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'demolisher'), newName,
            { memory: { role: 'demolisher' } });
    } else if (spawn && dismantlers.length < 1 && Game.flags['Breach']) {
        let newName = getNerdyName();
        console.log('Spawning new dismantler: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'dismantler'), newName,
            { memory: { role: 'dismantler' } });
    } else if (spawn && distributors.length < 1 && spawn.room.terminal) {
        let needsDistribution = false;
        for (let resourceType in spawn.room.terminal.store) {
            if (spawn.room.terminal.store[resourceType] > 3000) {
                needsDistribution = true;
                break;
            }
        }
        if (needsDistribution) {
            let newName = getNerdyName();
            console.log('Spawning new distributor: ' + newName);
            spawn.spawnCreep(getCreepBody(spawn.room, 'distributor'), newName,
                { memory: { role: 'distributor' } });
        }
    } else if (spawn && claimers.length < 1 && Game.flags['Claim']) {
        let newName = getNerdyName();
        console.log('Spawning new claimer: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'claimer'), newName,
            { memory: { role: 'claimer' } });
    } else if (spawn && bigClaimers.length < 1 && Game.flags['Reserve']) {
        let newName = getNerdyName();
        console.log('Spawning new bigClaimer: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'bigClaimer'), newName,
            { memory: { role: 'bigClaimer' } });
    } else if (spawn && remoteMiners.length < 2 && Game.flags['Remote']) {
        let newName = getNerdyName();
        console.log('Spawning new remoteMiner: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'remoteMiner'), newName,
            { memory: { role: 'remoteMiner' } });
    } else if (spawn && remoteBuilders.length < 1 && Game.flags['Remote']) {
        let newName = getNerdyName();
        console.log('Spawning new remoteBuilder: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'remoteBuilder'), newName,
            { memory: { role: 'remoteBuilder' } });
    } else if (spawn && remoteHaulers.length < 1 && Game.flags['Remote']) {
        let newName = getNerdyName();
        console.log('Spawning new remoteHauler: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'remoteHauler'), newName,
            { memory: { role: 'remoteHauler' } });
    } else if (spawn && remoteHarvesters.length < 1 && Game.flags['Remote']) {
        let newName = getNerdyName();
        console.log('Spawning new remoteHarvester: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'remoteHarvester'), newName,
            { memory: { role: 'remoteHarvester' } });
    } else if (spawn && remoteStationaryHarvesters.length < 1 && Game.flags['Remote']) {
        let newName = getNerdyName();
        console.log('Spawning new remoteStationaryHarvester: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'remoteStationaryHarvester'), newName,
            { memory: { role: 'remoteStationaryHarvester' } });
    } else if (spawn && energyHaulers.length < 1 && Game.flags['Remote']) {
        let newName = getNerdyName();
        console.log('Spawning new energyHauler: ' + newName);
        spawn.spawnCreep(getCreepBody(spawn.room, 'energyHauler'), newName,
            { memory: { role: 'energyHauler' } });
    }

    if (spawn && spawn.spawning) {
        var spawningCreep = Game.creeps[spawn.spawning.name];
        spawn.room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            spawn.pos.x + 1,
            spawn.pos.y,
            { align: 'left', opacity: 0.8 });
    }
    //#endregion

    //#region Tower Defense System (Coordinated with Soldiers)
    if (spawn) {
        let towers = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER }
        });

        for (let tower of towers) {
            // 1. Heal Critical Friendlies (Soldiers/Medics)
            let criticalCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: (c) => c.hits < c.hitsMax * 0.5 && (c.memory.role == 'soldier' || c.memory.role == 'medic')
            });
            if (criticalCreep) {
                tower.heal(criticalCreep);
                continue;
            }

            // 2. Attack Hostiles
            let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                tower.attack(closestHostile);
                continue;
            }

            // 3. Repair Structures (Exclude walls to save energy for defense)
            let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL
            });
            if (closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
        }
    }
    //#endregion

    //#region Power Spawn Processing
    if (spawn) {
        let powerSpawn = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_POWER_SPAWN }
        })[0];
        if (powerSpawn) {
            powerSpawn.processPower();
        }
    }

    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
        if (creep.memory.role == 'wallRepairer') {
            roleWallRepairer.run(creep);
        }
        if (creep.memory.role == 'soldier') {
            roleSoldier.run(creep);
        }
        if (creep.memory.role == 'medic') {
            roleMedic.run(creep);
        }
        if (creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if (creep.memory.role == 'hauler') {
            roleHauler.run(creep);
        }
        if (creep.memory.role == 'scout') {
            roleScout.run(creep);
        }
        if (creep.memory.role == 'demolisher') {
            roleDemolisher.run(creep);
        }
        if (creep.memory.role == 'dismantler') {
            roleDismantler.run(creep);
        }
        if (creep.memory.role == 'distributor') {
            roleDistributor.run(creep);
        }
        if (creep.memory.role == 'claimer') {
            roleClaimer.run(creep);
        }
        if (creep.memory.role == 'bigClaimer') {
            roleBigClaimer.run(creep);
        }
        if (creep.memory.role == 'remoteMiner') {
            roleRemoteMiner.run(creep);
        }
        if (creep.memory.role == 'remoteBuilder') {
            roleRemoteBuilder.run(creep);
        }
        if (creep.memory.role == 'remoteHauler') {
            roleRemoteHauler.run(creep);
        }
        if (creep.memory.role == 'remoteHarvester') {
            roleRemoteHarvester.run(creep);
        }
        if (creep.memory.role == 'remoteStationaryHarvester') {
            roleRemoteStationaryHarvester.run(creep);
        }
        if (creep.memory.role == 'energyHauler') {
            roleEnergyHauler.run(creep);
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

//#region Helper Functions
function getCreepBody(room, role) {
    let capacity = room.energyCapacityAvailable;

    // Emergency Recovery: If no harvesters, use current energy to spawn ASAP
    if (role === 'harvester') {
        const harvesters = room.find(FIND_MY_CREEPS, { filter: c => c.memory.role === 'harvester' });
        if (harvesters.length === 0) {
            capacity = room.energyAvailable;
        }
    }

    let body = [];
    if (role === 'harvester' || role === 'upgrader' || role === 'builder' || role === 'repairer' || role === 'wallRepairer') {
        // Standard Worker: WORK, CARRY, MOVE, MOVE (250 cost)
        let parts = Math.floor(capacity / 250);
        parts = Math.min(parts, 8); // Cap at 8 segments (2000 energy)

        if (parts === 0) {
            // Fallback for very low energy recovery
            if (capacity >= 200) return [WORK, CARRY, MOVE];
            return [WORK, CARRY, MOVE, MOVE];
        }
        for (let i = 0; i < parts; i++) {
            body.push(WORK); body.push(CARRY); body.push(MOVE); body.push(MOVE);
        }
    } else if (role === 'soldier') {
        // Soldier: TOUGH, ATTACK, MOVE (140 cost)
        let parts = Math.floor(capacity / 140);
        parts = Math.min(parts, 10);
        if (parts === 0) parts = 1;
        // Group parts for better survivability (TOUGH first)
        for (let i = 0; i < parts; i++) body.push(TOUGH);
        for (let i = 0; i < parts; i++) body.push(ATTACK);
        for (let i = 0; i < parts; i++) body.push(MOVE);
    } else if (role === 'medic') {
        // Medic: HEAL, MOVE (300 cost)
        let parts = Math.floor(capacity / 300);
        parts = Math.min(parts, 5);
        if (parts === 0) parts = 1;
        for (let i = 0; i < parts; i++) {
            body.push(HEAL); body.push(MOVE);
        }
    } else if (role === 'miner') {
        // Miner: High WORK, low MOVE (Stationary)
        // Max 5 WORK parts needed for a source (10 energy/tick)
        let workParts = Math.floor((capacity - 50) / 100); // Reserve 50 for 1 MOVE
        workParts = Math.min(workParts, 5);
        if (workParts === 0) workParts = 1;

        for (let i = 0; i < workParts; i++) body.push(WORK);
        body.push(MOVE);
    } else if (role === 'hauler') {
        // Hauler: CARRY and MOVE (1:1 ratio for roads)
        let parts = Math.floor(capacity / 100); // 50 CARRY + 50 MOVE = 100
        parts = Math.min(parts, 10);
        if (parts === 0) parts = 1;
        for (let i = 0; i < parts; i++) body.push(CARRY);
        for (let i = 0; i < parts; i++) body.push(MOVE);
    } else if (role === 'scout') {
        return [MOVE];
    } else if (role === 'demolisher') {
        // Demolisher: WORK, MOVE (150 cost)
        let parts = Math.floor(capacity / 150);
        parts = Math.min(parts, 10);
        if (parts === 0) parts = 1;
        for (let i = 0; i < parts; i++) body.push(WORK);
        for (let i = 0; i < parts; i++) body.push(MOVE);
    } else if (role === 'dismantler') {
        // Dismantler: High WORK to break walls, MOVE (150 cost)
        let parts = Math.floor(capacity / 150);
        parts = Math.min(parts, 15);
        if (parts === 0) parts = 1;
        for (let i = 0; i < parts; i++) body.push(WORK);
        for (let i = 0; i < parts; i++) body.push(MOVE);
    } else if (role === 'distributor') {
        // Distributor: CARRY, MOVE (100 cost)
        let parts = Math.floor(capacity / 100);
        parts = Math.min(parts, 25); // Max 50 parts total
        if (parts === 0) parts = 1;
        for (let i = 0; i < parts; i++) body.push(CARRY);
        for (let i = 0; i < parts; i++) body.push(MOVE);
    } else if (role === 'claimer') {
        return [CLAIM, MOVE];
    } else if (role === 'bigClaimer') {
        // BigClaimer: High CLAIM, MOVE (650 cost per pair)
        let parts = Math.floor(capacity / 650);
        parts = Math.min(parts, 5); // Max 5 CLAIM parts
        if (parts === 0) parts = 1;
        for (let i = 0; i < parts; i++) body.push(CLAIM);
        for (let i = 0; i < parts; i++) body.push(MOVE);
    } else if (role === 'remoteMiner') {
        // Remote Miner: WORK, MOVE, CARRY (Balanced for travel)
        let parts = Math.floor((capacity - 50) / 150); // 1 WORK (100) + 1 MOVE (50) = 150. Reserve 50 for CARRY.
        parts = Math.min(parts, 5);
        if (parts === 0) parts = 1;
        for (let i = 0; i < parts; i++) body.push(WORK);
        for (let i = 0; i < parts; i++) body.push(MOVE);
        body.push(CARRY);
    } else if (role === 'remoteBuilder' || role === 'remoteHarvester') {
        // Standard Worker body
        let parts = Math.floor(capacity / 250);
        parts = Math.min(parts, 5);
        if (parts === 0) parts = 1;
        for (let i = 0; i < parts; i++) { body.push(WORK); body.push(CARRY); body.push(MOVE); body.push(MOVE); }
    } else if (role === 'remoteHauler' || role === 'energyHauler') {
        // Hauler body: CARRY + MOVE
        let parts = Math.floor(capacity / 100);
        parts = Math.min(parts, 10);
        if (parts === 0) parts = 1;
        for (let i = 0; i < parts; i++) body.push(CARRY);
        for (let i = 0; i < parts; i++) body.push(MOVE);
    } else if (role === 'remoteStationaryHarvester') {
        // Stationary: High WORK, 1 MOVE, 1 CARRY (to build container)
        let workParts = Math.floor((capacity - 100) / 100); // 50 MOVE + 50 CARRY
        workParts = Math.min(workParts, 5);
        if (workParts === 0) workParts = 1;
        for (let i = 0; i < workParts; i++) body.push(WORK);
        body.push(CARRY);
        body.push(MOVE);
    }
    return body;
}

function getNerdyName() {
    var names = ["Albert", "Marie", "Isaac", "Ada", "Nikola", "Galileo", "Charles", "Rosalind", "Niels", "Richard", "Stephen", "Grace", "Blaise", "Leonardo", "Alan", "Katherine", "Euclid", "Pythagoras", "Archimedes", "Hypatia", "Copernicus", "Kepler", "Descartes", "Pascal", "Newton", "Leibniz", "Euler", "Lagrange", "Laplace", "Gauss", "Riemann", "Maxwell", "Curie", "Rutherford", "Bohr", "Heisenberg", "Schrodinger", "Dirac", "Feynman", "Hawking", "Sagan", "Tyson", "Lovelace", "Hopper", "Knuth", "Torvalds"];
    var name = names[Math.floor(Math.random() * names.length)];
    return name + '_' + Game.time;
}
//#endregion