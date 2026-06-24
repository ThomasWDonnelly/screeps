/**
 * Squad Manager
 * 
 * Automatically groups 'tactical' creeps into squads.
 */
module.exports = {
    run: function(room) {
        const SQUAD_SIZE = 3;
        
        const availableUnits = room.find(FIND_MY_CREEPS, {
            filter: (c) => c.memory.role === 'tactical' && !c.memory.squadId && !c.spawning
        });

        if (availableUnits.length >= SQUAD_SIZE) {
            const squadId = 'Alpha_' + Game.time.toString(36);
            for (let i = 0; i < SQUAD_SIZE; i++) {
                availableUnits[i].memory.squadId = squadId;
            }
        }
    }
};