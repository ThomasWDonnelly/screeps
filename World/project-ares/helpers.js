module.exports = {
    /**
     * Automatically detects lab setup based on connectivity (neighbors in range 2).
     * Assumes the 2 labs with the most neighbors are inputs.
     * @param {Room} room 
     */
    detectLabConfig: function(room) {
        var labs = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LAB } });
        if (labs.length < 3) return;

        // Find neighbors for each lab (labs within range 2)
        var scores = labs.map(lab => {
            var neighbors = labs.filter(l => l.id !== lab.id && l.pos.inRangeTo(lab, 2));
            return { lab: lab, neighbors: neighbors.length };
        });

        // Sort by neighbors descending (Central labs are inputs)
        scores.sort((a, b) => b.neighbors - a.neighbors);

        var input1 = scores[0].lab;
        var input2 = scores[1].lab;
        var outputs = scores.slice(2).map(s => s.lab.id);

        room.memory.labConfig = {
            input1: input1.id,
            input2: input2.id,
            outputs: outputs
        };
        
        console.log(`[LabManager] Auto-configured labs in ${room.name}`);
    },

    getReactionIngredients: function(product) {
        for (let r1 in REACTIONS) {
            for (let r2 in REACTIONS[r1]) {
                if (REACTIONS[r1][r2] === product) {
                    return [r1, r2];
                }
            }
        }
        return null;
    },
    
};