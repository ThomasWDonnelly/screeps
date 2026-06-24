/**
 * Role: Commander
 * 
 * High-level strategic decision maker.
 * Analyzes Intel to place flags for exploration and attacks.
 * Directs Squads.
 */
module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // 1. Analyze Intel
        if (!Memory.intel) Memory.intel = {};
        
        let bestTarget = null;
        let bestExplore = null;
        
        // Find potential targets
        for (let roomName in Memory.intel) {
            let data = Memory.intel[roomName];
            
            // Ignore my own rooms
            if (data.owner === creep.owner.username) continue;
            
            // Identify Hostile Rooms for Retaliation
            if (data.owner && data.owner !== 'Invader' && data.owner !== 'Source Keeper') {
                // Simple logic: If it's an enemy, it's a target
                bestTarget = roomName;
            }
            
            // Identify Old Intel for Exploration
            if (Game.time - data.lastScouted > 5000) {
                bestExplore = roomName;
            }
        }

        // 2. Manage Retaliation Flag
        if (bestTarget) {
            if (!Game.flags['Retaliate']) {
                // We don't have visibility to place it exactly, so we place it in our room pointing to it?
                // Flags must be placed in visible rooms or via console. 
                // Programmatically, we can only create flags in rooms we see.
                // However, we can direct squads to a room name.
                // For this implementation, we will place the flag if we have vision, 
                // or rely on the squad logic to accept a room name target if we update it.
                // Since we can't place flags in the dark, the Commander will place a 'Staging' flag locally
                // and print the target to console for the player to confirm/place.
                console.log(`[Commander] Target Identified: ${bestTarget}. Place 'Retaliate' flag there.`);
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