/**
 * Role: Coroner
 * Analyzes death records in Memory.catacombs to provide statistics on creep lifespans.
 */
module.exports = {
    run: function() {
        if (!Memory.catacombs) return;

        console.log('💀 --- CORONER REPORT --- 💀');
        const stats = {};

        for (const name in Memory.catacombs) {
            const record = Memory.catacombs[name];
            const role = record.role || 'unknown';
            
            if (!stats[role]) {
                stats[role] = { count: 0, totalLife: 0 };
            }

            if (record.lifetimeTicks) {
                stats[role].count++;
                stats[role].totalLife += record.lifetimeTicks;
            }
        }

        for (const role in stats) {
            const avg = (stats[role].totalLife / stats[role].count).toFixed(1);
            console.log(`Role: ${role.padEnd(20)} | Count: ${stats[role].count.toString().padEnd(4)} | Avg Lifespan: ${avg}`);
        }
        console.log('-----------------------------');
    }
};