/**
 * Role: Necromancer
 * 
 * Uses dark arts to restore memory from the catacombs.
 * Triggered by placing a 'Resurrect' flag.
 */
module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        let flag = Game.flags['Resurrect'];
        if (flag) {
            if (!creep.pos.inRangeTo(flag, 1)) {
                creep.moveToTarget(flag, '#000000');
            } else {
                // Perform Ritual
                if (Memory.catacombs && Object.keys(Memory.catacombs).length > 0) {
                    // Find the most recently deceased (highest timeOfDeath)
                    let deadCreepName = Object.keys(Memory.catacombs).sort((a, b) => Memory.catacombs[b].timeOfDeath - Memory.catacombs[a].timeOfDeath)[0];
                    
                    if (deadCreepName) {
                        console.log(`[Necromancer] Resurrecting ${deadCreepName}...`);
                        
                        // Restore Memory
                        Memory.creeps[deadCreepName] = Memory.catacombs[deadCreepName];
                        Memory.creeps[deadCreepName].resurrecting = true;
                        
                        // Clean up death record
                        delete Memory.catacombs[deadCreepName];
                        
                        // Consume Flag
                        flag.remove();
                        
                        creep.say('⚡ RISE ⚡');
                    }
                } else {
                    creep.say('❌ No Dead');
                }
            }
        }
    }
};