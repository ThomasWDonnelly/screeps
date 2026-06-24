module.exports = {
    // Debug Logging Configuration
    debug: {
        // Enable/Disable specific log categories used by debugLog('category', ...)
        spawning: true,
        combat: true,
        construction: true,
        economy: true,

        // Creep specific logging (creep.creepLog)
        creepLog: {
            roles: '*', // Filter by role: '*' for all, or ['miner', 'hauler']
            rooms: '*'  // Filter by room: '*' for all, or ['W1N1']
        }
    },

    // General Game Settings
    settings: {
        wallTargetHits: 5000000,
        rampartTargetHits: 5000000,
        soldierRetreatHealth: 0.4,
        medicRetreatHealth: 0.4
    }
};