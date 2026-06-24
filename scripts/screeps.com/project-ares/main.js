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
    'archaeologist': roleArchaeologist,
};

module.exports.loop = function () {
    // "Bring Out Your Dead" - The Mortician handles dead creep memory
    roleMortician.run();

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
    for (let name in Game.rooms) {
        console.log('Room "' + name + '" has ' + Game.rooms[name].energyAvailable + ' energy');
    }

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

    // Auto-Build Road to Spawn from first Source
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

    // Auto-Build Roads to Controller (Check every 1000 ticks)
    if (spawn && Game.time % 1000 === 0) {
        let path = spawn.pos.findPathTo(spawn.room.controller, { ignoreCreeps: true });
        for (let i = 0; i < path.length; i++) {
            spawn.room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
        }
    }
    //#endregion

    //#region Auto-Build Extensions
    // (Check every 100 ticks)
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

    //#region Auto-Build Containers
    // (Check every 500 ticks)
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

    //#region Auto-Build Extractor
    // (Check every 1000 ticks)
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

    //#region Link System
    // (Transfer Energy from Source to Controller/Storage)
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
        let powerSpawn = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_POWER_SPAWN }
        })[0];
        if (powerSpawn) {
            powerSpawn.processPower();
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