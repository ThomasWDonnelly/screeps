/**
 * Role: Mortician
 * This is a system 'role' that runs once per tick to manage the memory of dead creeps.
 * It announces "Bring Out Your Dead" and archives creep memory for post-mortem analysis.
 */
const roleMortician = {
    run: function() {
        // Initialize the catacombs if it doesn't exist
        if (!Memory.catacombs) {
            Memory.catacombs = {};
        }

        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                // Skip if the creep is being resurrected
                if (Memory.creeps[name].resurrecting) continue;

                console.log('Bring Out Your Dead! A fallen creep: ' + name);

                // Move memory to catacombs for post-mortem analysis
                const creepMemory = Memory.creeps[name];
                creepMemory.timeOfDeath = Game.time;
                
                if (creepMemory.spawnTime) {
                    creepMemory.lifetimeTicks = Game.time - creepMemory.spawnTime;
                    // Heuristic: Standard creep life is 1500 ticks. If significantly less, it was premature.
                    // Note: Claimers have 600 ticks, so this is a generalization.
                    creepMemory.causeOfDeath = (creepMemory.lifetimeTicks < 1400) ? 'premature (combat/accident)' : 'natural causes';
                }

                Memory.catacombs[name] = creepMemory;

                delete Memory.creeps[name];
            }
        }

        // Periodic Cleanup of Catacombs (Every 100 ticks)
        if (Game.time % 100 === 0) {
            for (let name in Memory.catacombs) {
                if (Game.time - Memory.catacombs[name].timeOfDeath > 20000) {
                    delete Memory.catacombs[name];
                }
            }
        }
    }
};

module.exports = roleMortician;