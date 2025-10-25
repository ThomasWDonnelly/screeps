import { } from 'game/utils';
import { } from 'game/prototypes';
import { } from 'game/constants';
import { } from 'arena/season_beta/capture_the_flag/basic';

module.exports.loop = function () {

    // 1. Initial Setup (Run only once)
    if (!Memory.initialized) {
        // Initialize memory or setup variables if needed
        Memory.initialized = true;
        Memory.flagPos = Game.spawns.Spawn1.pos; // Or the actual flag position
        Memory.enemyFlagPos = { x: 40, y: 10 }; // Example: Adjust for the arena map
    }

    // 2.Spawn Logic: Ensure you have a balanced force of attackers and defenders
    spawnCreeps();

    // 3. Creep Logic: Assign tasks to all exisitng creeps
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.role === 'guard') {
            runGuard(creep);
        } else if (creep.memory.role === 'pusher') {
            runPusher(creep);
        }
    }

    // 4. Tower Logic: The core of your defense
    runTowers();
};

function spawnCreeps() {
    const desiredGuards = 2;
    const desiredPushers = 2;

    const guards = Object.values(Game.creeps).filter(c => c.memory.role === 'guard');
    const pushers = Object.values(Game.creeps).filter(c => c.memory.role === 'pusher');

    if (guards.length < desiredGuards) {
        const name = `Guard${Game.time}`;
        Game.spawns.Spawn1.spawnCreep([MOVE, ATTACK, TOUGH], name, { memory: { role: 'guard' } });
    }

    if (pushers.length < desiredPushers) {
        const name = `Pusher${Game.time}`;
        Game.spawns.Spawn1.spawnCreep([MOVE, CARRY, TOUGH], name, { memory: { role: 'pusher' } });
    }
}

function runGuard(creep) {
    // Move to defend our flag position
    const flagPos = Memory.flagPos;
    if (!creep.pos.isNearTo(flagPos)) {
        creep.moveTo(flagPos);
        return;
    }

    // Attack any enemy in range
    const enemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1);
    if (enemies.length > 0) {
        creep.attack(enemies[0]);
    }
}

function runPusher(creep) {
    // Move towards the enemy flag position
    const targetPos = Memory.enemyFlagPos;
    if (!creep.pos.isNearTo(targetPos)) {
        creep.moveTo(targetPos);
        return;
    }

    // If at the enemy flag, try to pick it up (simulate capture)
    const flag = creep.pos.findClosestByRange(FIND_FLAGS);
    if (flag && creep.pos.isNearTo(flag.pos)) {
        creep.pickup(flag); // If the flag is an object you can pick up
    }

    // If carrying the flag, move back to your own flag position
    if (creep.carry && creep.carry.flag) {
        const homePos = Memory.flagPos;
        if (!creep.pos.isNearTo(homePos)) {
            creep.moveTo(homePos);
        } else {
            // Drop the flag at your base
            creep.drop('flag');
        }
    }
}

function runTowers() {
    // Find all towers
    const towers = Object.values(Game.structures).filter(s => s.structureType === STRUCTURE_TOWER);

    for (const tower of towers) {
        // Prioritize attacking hostile creeps in range
        const target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
            tower.attack(target);
            continue;
        }

        // Optionally, heal friendly creeps if no enemies
        const damagedAlly = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: c => c.hits < c.hitsMax
        });
        if (damagedAlly) {
            tower.heal(damagedAlly);
        }
    }
}

