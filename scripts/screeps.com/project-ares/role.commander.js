/**
 * Role: Commander
 * 
 * High-level strategic decision maker.
 * Analyzes Intel to place flags for exploration and attacks.
 * Directs Squads.
 */
const diplomacy = require('diplomacy');
const heralds = require('heralds');

module.exports = {
    /** @param {Creep} creep **/
    run: function (creep) {
        // 1. Analyze Intel
        if (!Memory.intel) Memory.intel = {};
        const prophecy = Memory.oracle ? Memory.oracle.prophecy : null;

        let potentialTargets = [];
        let bestExplore = null;

        // Find potential targets
        for (let roomName in Memory.intel) {
            let data = Memory.intel[roomName];

            // Identify Hostile Rooms for Retaliation, ignoring own rooms and allies
            if (data.owner && data.owner !== creep.owner.username && diplomacy.getStatus(data.owner) !== 'ally') {
                // Score the target. Lower score is better.
                // Prioritize low RCL, few towers.
                let score = (data.rcl * 10) + (data.hostileTowers * 20);

                // Bonus for being a declared enemy
                if (diplomacy.getStatus(data.owner) === 'enemy') {
                    score -= 50;
                }

                // HUGE bonus if it's the target of a CONQUEST prophecy
                if (prophecy && prophecy.type === 'CONQUEST' && prophecy.target === data.owner) {
                    score -= 1000; // Make this the top priority
                }

                potentialTargets.push({ roomName, score });
            }

            // Identify Old Intel for Exploration
            if (Game.time - data.lastScouted > 5000) {
                bestExplore = roomName;
            }
        }

        // Sort targets by score to find the best one
        potentialTargets.sort((a, b) => a.score - b.score);
        let bestTarget = potentialTargets.length > 0 ? potentialTargets[0].roomName : null;

        // 2. Manage Retaliation Flag
        if (bestTarget) {
            if (!Game.flags['Retaliate']) {
                // If we have vision of the target room (from an observer), place the flag.
                const targetRoom = Game.rooms[bestTarget];
                if (targetRoom) {
                    const hostileSpawn = targetRoom.find(FIND_HOSTILE_SPAWNS)[0];
                    const flagPos = hostileSpawn ? hostileSpawn.pos : new RoomPosition(25, 25, bestTarget);
                    targetRoom.createFlag(flagPos, 'Retaliate', COLOR_RED);
                    console.log(`[Commander] Target acquired in ${bestTarget}. Placing Retaliate flag!`);

                    // Announce via Herald
                    const targetOwner = Memory.intel[bestTarget].owner;
                    if (targetOwner) {
                        heralds.sendMessage(`Hostilities declared against ${targetOwner} in room ${bestTarget}.`);
                    }
                } else {
                    console.log(`[Commander] Target Identified: ${bestTarget}. Waiting for vision to place flag.`);
                }
            }
        }

        // 3. Manage Exploration Flag
        if (!Game.flags['Explore']) {
            // If we have a target room from intel, try to path to it
            if (bestExplore) {
                console.log(`[Commander] Intel stale for ${bestExplore}. Scout needed.`);
            } else {
                // Pick a random exit from the current room to explore
                const exits = Game.map.describeExits(creep.room.name);
                const dirs = Object.keys(exits);
                if (dirs.length > 0) {
                    const targetRoom = exits[dirs[Math.floor(Math.random() * dirs.length)]];

                    // Place flag at the exit
                    const exitDir = creep.room.findExitTo(targetRoom);
                    const exit = creep.pos.findClosestByRange(exitDir);
                    if (exit) {
                        creep.room.createFlag(exit, 'Explore', COLOR_WHITE);
                    }
                }
            }
        }

        // 4. Direct Squads
        // Move Phalanx flags towards Retaliate flag
        const attackFlag = Game.flags['Retaliate'];
        if (attackFlag) {
            for (let flagName in Game.flags) {
                if (flagName.startsWith('Phalanx_')) {
                    const squadFlag = Game.flags[flagName];
                    // If squad flag is far from attack flag, move it closer
                    if (squadFlag.pos.roomName !== attackFlag.pos.roomName) {
                        // This requires advanced pathfinding across rooms
                        // For now, simply log the directive
                        // creep.say('👉 Attack');
                    } else {
                        squadFlag.setPosition(attackFlag.pos);
                    }
                }
            }
        }

        // Visuals
        creep.say('🧠 Cmd');
    }
};