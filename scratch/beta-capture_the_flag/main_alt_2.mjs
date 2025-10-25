import { } from 'game/utils';
import { } from 'game/prototypes';
import { } from 'game/constants';
import { } from 'arena/season_beta/capture_the_flag/basic';

// export function loop() {

//     // 1. Initial Setup (Run only once)
//     if (!Memory.initialized) {
//         // Initialize memory or setup variables if needed
//         Memory.initialized = true;
//         Memory.flagPos = Game.spawns.Spawn1.pos; // Or the actual flag position
//         Memory.enemyFlagPos = { x: 40, y: 10 }; // Example: Adjust for the arena map
//     }

//     // 2.Spawn Logic: Ensure you have a balanced force of attackers and defenders
//     spawnCreeps();

//     // 3. Creep Logic: Assign tasks to all exisitng creeps
//     for (const name in Game.creeps) {
//         const creep = Game.creeps[name];
//         if (creep.memory.role === 'guard') {
//             runGuard(creep);
//         } else if (creep.memory.role === 'pusher') {
//             runPusher(creep);
//             // runPusherV2(creep);
//         }
//     }

//     // 4. Tower Logic: The core of your defense
//     runTowers();
// }

export function loop() {
    // 1. Initial Setup (Run only once)
    if (!Memory.initialized) {
        Memory.initialized = true;
        Memory.flagPos = Game.spawns.Spawn1.pos;
        Memory.enemyFlagPos = {x: 40, y: 10};
        
        // Dynamic Variable: The default ratio is 2 Pushers to 1 Guard.
        Memory.pusherRatio = 2; 
        Memory.lastLossCount = 0; // Tracks if we've lost more units recently
    }

    // 2. Adaptive Logic: Check for recent losses and enemy composition
    adjustPusherRatio();
    
    // 3. Spawn Logic: Use the adjusted ratio
    spawnCreeps();

    // ... [Omitted existing creep and tower logic for brevity] ...
}

const MAX_CREEPS = 15;
const PUSHER_RATIO = 2 // For every 1 guard, spawn 2 pushers

function spawnCreeps() {
    const spawn = Game.spawns.Spawn1;
    const currentCreeps = Object.keys(Game.creeps).length;

    if (currentCreeps >= MAX_CREEPS) {
        return; // Max creeps reached
    }

    const guards = _.filter(Game.creeps, (c) => c.memory.role == 'guard').length;
    const pushers = _.filter(Game.creeps, (c) => c.memory.role == 'pusher').length;

    // A balanced body with MOVE, ATTACK, RANGED_ATTACK, HEAL, and TOUGH
    const bodyParts = [
        TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE,
        ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK,
        HEAL, HEAL
    ];

    if (guards * PUSHER_RATIO <= pushers) {
        // Need more guards for defense
        spawn.spawnCreep(bodyParts, 'Guard' + Game.time, { memory: { role: 'guard' } });
    } else {
        // Need more pushers for offense
        spawn.spawnCreep(bodyParts, 'Pusher' + Game.time, { memory: { role: 'pusher' } });
    }
}

// // Define maximums and body parts as before
// const MAX_CREEPS = 15;
// const CREATIVE_BODY_PARTS = [
//     TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE,
//     ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK,
//     HEAL, HEAL
// ];

// function spawnCreeps() {
//     const spawn = Game.spawns.Spawn1;
//     const currentCreeps = Object.keys(Game.creeps).length;

//     if (currentCreeps >= MAX_CREEPS || spawn.spawning) {
//         return;
//     }

//     const guards = _.filter(Game.creeps, (c) => c.memory.role == 'guard').length;
//     const pushers = _.filter(Game.creeps, (c) => c.memory.role == 'pusher').length;

//     // Use the dynamic ratio from memory
//     const desiredPusherRatio = Memory.pusherRatio;

//     // Check if the current ratio is lower than the desired ratio
//     // (i.e., we need more pushers to reach the desired aggression level)
//     if (pushers < guards * desiredPusherRatio) {
//         // Need more pushers (Offense)
//         spawn.spawnCreep(CREATIVE_BODY_PARTS, 'Pusher' + Game.time, { memory: { role: 'pusher' } });
//     } else {
//         // Current ratio is met or exceeded: prioritize spawning a Guard (Defense)
//         spawn.spawnCreep(CREATIVE_BODY_PARTS, 'Guard' + Game.time, { memory: { role: 'guard' } });
//     }
// }

function runGuard(creep) {
    // Priority 1: Defend the flag position
    const myFlag = Game.getObjectById(Memory.flagPos.id);

    // Priority 2: Heal self or nearby friendly creeps
    const damagedFriendlies = creep.pos.findInRange(FIND_MY_CREEPS, 3, {
        filter: (c) => c.hits < c.hitsMax
    });
    if (damagedFriendlies.length) {
        const target = damagedFriendlies[0];
        if (creep.heal(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
        return;
    }

    // Priority 3: Attack the closest hostile unit
    const hostileCreeps = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
    if (hostileCreeps.length) {
        const target = hostileCreeps[0];
        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        } else if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
            // Move into attack range if necessary, but try to stay defensive
        }
        return;
    }

    // Default: Return to a defensive spot near the flag/spawn
    if (!creep.pos.isEqualTo(Memory.flagPos)) {
        creep.moveTo(Memory.flagPos);
    }
}

// function runPusher(creep) {
//     // Priority 1 (Defensive Retreat): If health is low, retreat to the home flag for healing
//     const RETREAT_THRESHOLD = 0.5; // 50% health
//     if (creep.hits < creep.hitsMax * RETREAT_THRESHOLD) {
//         creep.say("RETREAT!");
//         creep.moveTo(Memory.flagPos); // Move to the safe zone with Guards/Towers
//         return;
//     }

//     // Priority 2 (Aggression): Attack the nearest hostile creep or structure (like a tower)
//     const hostileTargets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3).concat(
//         creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3));

//     if (hostileTargets.length) {
//         const target = hostileTargets[0];
//         if (creep.attack(target) == ERR_NOT_IN_RANGE) {
//             // Keep moving to engage, but ideally we should be in range
//             creep.moveTo(target);
//         }
//         creep.rangedAttack(target); // Use ranged attack while closing distance or for collateral damage
//         return;
//     }

//     // Priority 3 (Objective): Move to and step on the enemy's flag
//     const enemyFlag = new RoomPosition(Memory.enemyFlagPos.x, Memory.enemyFlagPos.y, creep.room.name);
//     creep.moveTo(enemyFlag);
// }

function runTowers() {
    const towers = Game.rooms[Game.spawns.Spawn1.room.name].find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_TOWER }
    });

    if (towers.length === 0) return;

    for (const tower of towers) {
        // Priority 1: Attack the closest hostile creep
        const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            tower.attack(closestHostile);
            continue;
        }

        // Priority 2: Repair severely damaged structures
        const damagedStructures = tower.pos.findInRange(FIND_MY_STRUCTURES, 10, {
            filter: (s) => s.hits < s.hitsMax * 0.1 && s.structureType != STRUCTURE_WALL
        });
        if (damagedStructures.length) {
            tower.repair(damagedStructures[0]);
            continue;
        }

        // Priority 3: Heal damaged friendly creeps
        const damagedCreeps = tower.pos.findInRange(FIND_MY_CREEPS, 10, {
            filter: (c) => c.hits < c.hitsMax
        });
        if (damagedCreeps.length) {
            tower.heal(damagedCreeps[0]);
        }
    }
}

//#region PathFinding
/**
 * Generates and caches a global Cost Matrix for efficient pathfinding.
 */
function getArenaCostMatrix() {
    // Check if the cost matrix is already in memory
    if (Memory.costMatrix) {
        return PathFinder.CostMatrix.deserialize(Memory.costMatrix);
    }

    // ➡️ Step 1: Start with the room's base cost matrix (walls, terrain)
    let costs = new PathFinder.CostMatrix();
    const room = Game.rooms[Object.keys(Game.rooms)[0]]; // Assuming one room in Arena

    // Apply terrain costs
    room.find(FIND_TERRAIN).forEach(tile => {
        if (tile.terrain === 'wall') {
            costs.set(tile.x, tile.y, 255); // Impassable
        } else if (tile.terrain === 'swamp') {
            costs.set(tile.x, tile.y, 10); // High cost
        } else {
            costs.set(tile.x, tile.y, 2);  // Default plain cost
        }
    });

    // ➡️ Step 2: Apply structure costs (e.g., roads, player structures)
    room.find(FIND_STRUCTURES).forEach(s => {
        if (s.structureType === STRUCTURE_ROAD) {
            // Roads are cheap to move on
            costs.set(s.pos.x, s.pos.y, 1);
        } else if (s.structureType !== STRUCTURE_CONTAINER &&
            (s.structureType !== STRUCTURE_RAMPART || !s.my)) {
            // All other unowned structures (including hostile towers, walls) are impassable
            costs.set(s.pos.x, s.pos.y, 255);
        }
    });

    // ➡️ Step 3: Cache the generated matrix
    Memory.costMatrix = costs.serialize();
    return costs;
}

// function runPusher(creep) {
//     // ... [Omitted existing logic for brevity] ...

//     // Priority 3 (Objective): Move to and step on the enemy's flag
//     const enemyFlag = new RoomPosition(Memory.enemyFlagPos.x, Memory.enemyFlagPos.y, creep.room.name);

//     // 💡 Replace creep.moveTo() with smartMove()
//     // creep.moveTo(enemyFlag); <-- OLD
//     smartMove(creep, enemyFlag); // <-- NEW

//     // ...
// }

/**
 * Finds and moves the creep to the target using PathFinder with a cached cost matrix.
 * @param {Creep} creep
 * @param {RoomPosition} goal
 */
function smartMove(creep, goal) {
    // Check if a path is already cached for the current task/goal
    const pathKey = `path_${goal.x}_${goal.y}`;
    if (!creep.memory[pathKey]) {
        // ➡️ Pathfinding options
        const searchOptions = {
            plainCost: 2,
            swampCost: 10,
            roomCallback: function() {
                // Use the cached cost matrix for all searches
                return getArenaCostMatrix();
            }
        };

        // ➡️ Run PathFinder.search
        const searchResult = PathFinder.search(
            creep.pos,
            { pos: goal, range: 1 }, // Target range of 1 (adjacent to goal)
            searchOptions
        );

        // Cache the path for future ticks
        creep.memory[pathKey] = searchResult.path;
        creep.memory.pathIndex = 0; // Start at the beginning of the path
    }

    // ➡️ Follow the cached path
    const path = creep.memory[pathKey];
    if (path && creep.memory.pathIndex < path.length) {
        const nextPos = path[creep.memory.pathIndex];
        const moveResult = creep.move(creep.pos.getDirectionTo(nextPos));

        if (moveResult === OK) {
            creep.memory.pathIndex++;
        } else if (moveResult === ERR_NOT_FOUND) {
            // If creep hits an obstacle (like a new enemy creep), clear cache and re-plan
            delete creep.memory[pathKey];
        }
    } else if (creep.pos.isEqualTo(goal)) {
        // Reached the destination
        delete creep.memory[pathKey];
    } else {
        // Path ended prematurely or search failed, clear to try again next tick
        delete creep.memory[pathKey];
    }
}
//#endregion

//#region Focus Fire Strategy
/**
 * Finds the highest priority hostile target on the map.
 * This is the main piece of coordination logic.
 * @returns {Structure | Creep | null} The object to focus fire on.
 */
function findGlobalTarget() {
    // 1. Check for Hostile Towers (Highest Priority)
    const hostileTowers = Game.rooms[Object.keys(Game.rooms)[0]].find(FIND_HOSTILE_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_TOWER
    });

    if (hostileTowers.length > 0) {
        // Focus on the closest tower to minimize travel time for the squad
        return Game.spawns.Spawn1.pos.findClosestByPath(hostileTowers);
    }

    // 2. Check for Hostile Creeps (Second Priority)
    const hostileCreeps = Game.rooms[Object.keys(Game.rooms)[0]].find(FIND_HOSTILE_CREEPS);

    if (hostileCreeps.length > 0) {
        // Prioritize the biggest threat: the creep with the highest ATTACK/RANGED_ATTACK parts
        let highestThreat = null;
        let maxDamageParts = 0;

        for (const creep of hostileCreeps) {
            // Count total damage-dealing parts
            const damageParts = creep.body.filter(p => p.type === ATTACK || p.type === RANGED_ATTACK).length;
            
            if (damageParts > maxDamageParts) {
                maxDamageParts = damageParts;
                highestThreat = creep;
            }
        }
        return highestThreat;
    }

    // 3. Default (If nothing else is in the room): Attack the flag
    const enemyFlagPos = new RoomPosition(Memory.enemyFlagPos.x, Memory.enemyFlagPos.y, Object.keys(Game.rooms)[0]);
    // NOTE: Creeps can't attack the flag, but they can move to it.
    // We return null here, and the pusher logic will default to moving to the flag.
    return null; 
}

function runPusher(creep) {
    // 1. Defensive Retreat: If health is low, retreat to the home flag for healing
    const RETREAT_THRESHOLD = 0.5; // 50% health
    if (creep.hits < creep.hitsMax * RETREAT_THRESHOLD) {
        creep.say("RETREAT!");
        // Use smartMove for retreat
        smartMove(creep, Memory.flagPos);
        return;
    }

    // 2. Objective/Aggression: Determine the coordinated target
    const target = findGlobalTarget();

    if (target) {
        // Found a high-priority target (Tower or dangerous Creep)

        // Attack Logic: Attack if in range
        if (creep.attack(target) === ERR_NOT_IN_RANGE) {
            creep.rangedAttack(target); // Use ranged attack while approaching
        }
        creep.rangedAttack(target); // Try ranged attack every tick

        // Movement Logic: Move toward the coordinated target
        // Use smartMove to efficiently path to the target
        smartMove(creep, target.pos);
        
        return;
    }

    // 3. Default Objective: Move to and capture the enemy's flag
    const enemyFlagPos = new RoomPosition(Memory.enemyFlagPos.x, Memory.enemyFlagPos.y, creep.room.name);
    
    // Use smartMove to path to the enemy flag
    smartMove(creep, enemyFlagPos);
}
//#endregion

//#region Adaptive Ratios
// Define the bounds for the ratio to prevent extreme or useless strategies
const MIN_PUSHER_RATIO = 0.5; // Favor defense: 1 Pusher for every 2 Guards
const MAX_PUSHER_RATIO = 4.0; // Favor offense: 4 Pushers for every 1 Guard

/**
 * Observes the current enemy composition and adjusts the desired pusher ratio.
 */
function adjustPusherRatio() {
    const hostileCreeps = Game.rooms[Object.keys(Game.rooms)[0]].find(FIND_HOSTILE_CREEPS);
    
    if (hostileCreeps.length === 0) {
        // No immediate threat observed. Default to a strong offensive posture.
        Memory.pusherRatio = Math.min(Memory.pusherRatio + 0.1, MAX_PUSHER_RATIO);
        return;
    }

    // Calculate a simple "Aggression Score" based on enemy damage parts
    let totalEnemyDamageParts = 0;
    for (const creep of hostileCreeps) {
        totalEnemyDamageParts += creep.body.filter(p => p.type === ATTACK || p.type === RANGED_ATTACK).length;
    }

    const AVG_EXPECTED_DAMAGE = 15; // A baseline average (you'd fine-tune this with testing)

    if (totalEnemyDamageParts > AVG_EXPECTED_DAMAGE) {
        // High Aggression Score: The enemy has a strong military presence.
        // ➡️ Shift to a defensive focus (lower pusher ratio).
        Memory.pusherRatio = Math.max(Memory.pusherRatio - 0.2, MIN_PUSHER_RATIO);
        Game.notify(`Shifted to Defensive: Enemy Damage Score ${totalEnemyDamageParts}. New Ratio: 1:${(1 / Memory.pusherRatio).toFixed(1)}`);

    } else if (totalEnemyDamageParts < AVG_EXPECTED_DAMAGE / 2) {
        // Low Aggression Score: The enemy is weak or focused on economy/healing.
        // ➡️ Shift to an aggressive focus (higher pusher ratio).
        Memory.pusherRatio = Math.min(Memory.pusherRatio + 0.2, MAX_PUSHER_RATIO);
        Game.notify(`Shifted to Aggressive: Enemy Damage Score ${totalEnemyDamageParts}. New Ratio: ${Memory.pusherRatio.toFixed(1)}:1`);
    }
}
//#endregion