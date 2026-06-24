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
let roomPlanner = require('room.planner');
let squadManager = require('squad.manager');
let roleSquad = require('role.squad');

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

    // Run room planner for each of your rooms.
    for (const roomName in Game.rooms) {
        roomPlanner.run(Game.rooms[roomName]);
    }

    // Run the squad manager
    squadManager.run();

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

    //#region Get creep counts in console
    const creepsByRole = _.groupBy(Object.values(Game.creeps), c => c.memory.role);
    const getRoleCount = (role) => (creepsByRole[role] || []).length;

    // Log current creep counts
    for (const roleName in creepsByRole) {
        console.log(`${roleName.charAt(0).toUpperCase() + roleName.slice(1)}s: ${creepsByRole[roleName].length}`);
    }
    //#endregion

    //#region Auto-Spawn Creeps
    if (spawn && !spawn.spawning) {
        const creepConfig = [
            // -- Core Roles --
            { role: 'harvester', desired: 4 },
            { role: 'miner', desired: 4 },
            { role: 'hauler', desired: 4, condition: () => getRoleCount('miner') > 0 },
            { role: 'upgrader', desired: 4 },
            { role: 'builder', desired: 6, condition: () => spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0 },
            { role: 'repairer', desired: 2 },
            { role: 'wallRepairer', desired: 1, condition: () => spawn.room.find(FIND_STRUCTURES, { filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits < 5000000 }).length > 0 },

            // -- Military Roles --
            { role: 'soldier', desired: 3 },
            { role: 'medic', desired: 4, condition: () => getRoleCount('soldier') >= 2 },

            // -- Specialized Roles (Flag-based) --
            { role: 'demolisher', desired: 1, condition: () => Game.flags['Demolish'] },
            { role: 'dismantler', desired: 1, condition: () => Game.flags['Breach'] },
            { role: 'claimer', desired: 1, condition: () => Game.flags['Claim'] },
            { role: 'bigClaimer', desired: 1, condition: () => Game.flags['Reserve'] },
            { role: 'distributor', desired: 1, condition: () => spawn.room.terminal && Object.values(spawn.room.terminal.store).some(amount => amount > 3000) },

            // -- Remote Roles (Flag-based) --
            { role: 'remoteMiner', desired: 2, condition: () => Game.flags['Remote'] },
            { role: 'remoteHauler', desired: 1, condition: () => Game.flags['Remote'] },
            { role: 'remoteBuilder', desired: 1, condition: () => Game.flags['Remote'] },
            { role: 'remoteHarvester', desired: 1, condition: () => Game.flags['Remote'] },
            { role: 'remoteStationaryHarvester', desired: 1, condition: () => Game.flags['Remote'] },
            { role: 'energyHauler', desired: 1, condition: () => Game.flags['Remote'] },
        ];

        for (const config of creepConfig) {
            const currentCount = getRoleCount(config.role);
            const meetsCondition = config.condition ? config.condition() : true;

            if (currentCount < config.desired && meetsCondition) {
                const body = getCreepBody(spawn.room, config.role);
                const bodyCost = body.reduce((cost, part) => cost + BODYPART_COST[part], 0);

                // Check if we can afford to spawn this creep
                if (spawn.room.energyAvailable >= bodyCost) {
                    const newName = getNerdyName();
                    const result = spawn.spawnCreep(body, newName, { memory: { role: config.role } });

                    if (result === OK) {
                        console.log(`Spawning new ${config.role}: ${newName}`);
                        // A spawn can only create one creep at a time, so we break the loop.
                        break;
                    }
                }
            }
        }
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

        const hostiles = spawn.room.find(FIND_HOSTILE_CREEPS);

        for (let tower of towers) {
            // 1. Attack Hostiles (Priority: Healers > Closest)
            if (hostiles.length > 0) {
                const healers = hostiles.filter(h => h.getActiveBodyparts(HEAL) > 0);
                const target = healers.length > 0 ? tower.pos.findClosestByRange(healers) : tower.pos.findClosestByRange(hostiles);
                if (target) {
                    tower.attack(target);
                    continue;
                }
            }

            // 2. Heal Damaged Friendlies (if no hostiles)
            const damagedCreeps = spawn.room.find(FIND_MY_CREEPS, { filter: c => c.hits < c.hitsMax });
            if (damagedCreeps.length > 0) {
                damagedCreeps.sort((a, b) => (a.hits / a.hitsMax) - (b.hits / b.hitsMax));
                tower.heal(damagedCreeps[0]);
                continue;
            }

            // 3. Repair Structures (if no hostiles, no damaged creeps, and tower has enough energy)
            if (tower.store.getUsedCapacity(RESOURCE_ENERGY) > tower.store.getCapacity(RESOURCE_ENERGY) * 0.75) {
                const damagedStructures = spawn.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
                });

                if (damagedStructures.length > 0) {
                    damagedStructures.sort((a, b) => (a.hits / a.hitsMax) - (b.hits / b.hitsMax));
                    tower.repair(damagedStructures[0]);
                }
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

    const roleRunners = {
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
        'energyHauler': roleEnergyHauler,
    };

    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        const roleRunner = roleRunners[creep.memory.role];
        if (roleRunner) {
            roleRunner.run(creep);
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
    const rcl = room.controller.level;
    let capacity = room.energyCapacityAvailable;

    // Emergency Recovery: If no harvesters or miners, use current energy to spawn ASAP.
    const harvesters = _.filter(Game.creeps, c => c.memory.role === 'harvester' && c.room.name === room.name).length;
    const miners = _.filter(Game.creeps, c => c.memory.role === 'miner' && c.room.name === room.name).length;
    if ((role === 'harvester' || role === 'miner') && harvesters === 0 && miners === 0) {
        capacity = room.energyAvailable;
    }

    // Define body templates for different roles and RCL tiers.
    const bodyTemplates = {
        // General purpose worker for early game, more specialized later.
        worker: [
            { rcl: 0, parts: [WORK, CARRY, MOVE], max: 8 }, // 200 cost, for RCL 1&2
            { rcl: 3, parts: [WORK, WORK, CARRY, MOVE], max: 6 }, // 300 cost, for RCL 3
            { rcl: 4, parts: [WORK, WORK, WORK, CARRY, MOVE, MOVE], max: 5 }, // 450 cost
        ],
        // Stationary miner, maxes out at 5 WORK parts for a source.
        miner: [
            { rcl: 0, parts: [WORK, WORK, MOVE], max: 1 }, // 250 cost
            { rcl: 3, parts: [WORK, WORK, WORK, WORK, WORK, MOVE], max: 1 }, // 550 cost
        ],
        // Haulers get bigger as roads and containers are established.
        hauler: [
            { rcl: 0, parts: [CARRY, CARRY, MOVE], max: 5 }, // 150 cost
            { rcl: 3, parts: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], max: 8 }, // 300 cost
        ],
        // Upgraders become more WORK-heavy as hauling is taken over by haulers.
        upgrader: [
            { rcl: 0, parts: [WORK, CARRY, MOVE], max: 8 }, // 200 cost
            { rcl: 4, parts: [WORK, WORK, WORK, CARRY, MOVE], max: 6 }, // 400 cost
        ],
        // Soldiers scale with energy.
        soldier: [
            { rcl: 0, parts: [TOUGH, ATTACK, MOVE, MOVE], max: 10 }, // 190 cost
            { rcl: 4, parts: [TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE], max: 8 }, // 410 cost
        ],
        medic: [
            { rcl: 0, parts: [HEAL, MOVE], max: 10 }, // 300 cost
        ],
        // Claimers are static.
        claimer: [
            { rcl: 0, parts: [CLAIM, MOVE], max: 1 } // 650 cost
        ],
        bigClaimer: [
            { rcl: 0, parts: [CLAIM, CLAIM, MOVE, MOVE], max: 4 } // 1300 cost
        ],
        // Remote creeps need to be self-sufficient.
        remoteWorker: [
            { rcl: 0, parts: [WORK, CARRY, MOVE, MOVE], max: 6 } // 250 cost
        ],
        remoteHauler: [
            { rcl: 0, parts: [CARRY, CARRY, MOVE], max: 10 } // 150 cost
        ],
        // Other roles can have simple definitions.
        scout: [{ rcl: 0, parts: [MOVE], max: 1 }],
        dismantler: [{ rcl: 0, parts: [WORK, MOVE], max: 20 }],
    };

    // Map roles to their templates
    const roleToTemplateMap = {
        'harvester': 'worker',
        'builder': 'worker',
        'repairer': 'worker',
        'wallRepairer': 'worker',
        'upgrader': 'upgrader',
        'miner': 'miner',
        'hauler': 'hauler',
        'soldier': 'soldier',
        'medic': 'medic',
        'claimer': 'claimer',
        'bigClaimer': 'bigClaimer',
        'remoteMiner': 'remoteWorker',
        'remoteBuilder': 'remoteWorker',
        'remoteHarvester': 'remoteWorker',
        'remoteStationaryHarvester': 'remoteWorker',
        'remoteHauler': 'remoteHauler',
        'energyHauler': 'remoteHauler',
        'scout': 'scout',
        'demolisher': 'dismantler',
        'dismantler': 'dismantler',
        'distributor': 'hauler',
    };

    const templateName = roleToTemplateMap[role] || 'worker'; // Default to worker
    const templates = bodyTemplates[templateName];

    // Find the best template for the current RCL
    const suitableTemplates = templates.filter(t => rcl >= t.rcl);
    const template = suitableTemplates.length > 0 ? suitableTemplates[suitableTemplates.length - 1] : templates[0];

    // Calculate cost of one segment
    const segmentCost = _.sum(template.parts, p => BODYPART_COST[p]);
    if (segmentCost === 0) return [];

    // Calculate how many segments can be afforded
    let numSegments = Math.floor(capacity / segmentCost);
    numSegments = Math.min(numSegments, template.max || 10); // Use template max, or default to 10

    // If we can't even afford one segment, try to build the smallest possible version
    if (numSegments === 0) {
        return (capacity >= segmentCost) ? template.parts : [];
    }

    // Build the body
    let body = [];
    for (let i = 0; i < numSegments; i++) {
        body = body.concat(template.parts);
    }

    // Ensure body does not exceed 50 parts
    return body.slice(0, 50);
}

function getNerdyName() {
    var names = ["Albert", "Marie", "Isaac", "Ada", "Nikola", "Galileo", "Charles", "Rosalind", "Niels", "Richard", "Stephen", "Grace", "Blaise", "Leonardo", "Alan", "Katherine", "Euclid", "Pythagoras", "Archimedes", "Hypatia", "Copernicus", "Kepler", "Descartes", "Pascal", "Newton", "Leibniz", "Euler", "Lagrange", "Laplace", "Gauss", "Riemann", "Maxwell", "Curie", "Rutherford", "Bohr", "Heisenberg", "Schrodinger", "Dirac", "Feynman", "Hawking", "Sagan", "Tyson", "Lovelace", "Hopper", "Knuth", "Torvalds"];
    var name = names[Math.floor(Math.random() * names.length)];
    return name + '_' + Game.time;
}
//#endregion