/**
 * Module: Diplomacy
 * 
 * Manages relationships with other players, tracking allies, neutrals, and enemies.
 * Player statuses are stored in Memory.diplomacy.
 */
const diplomacyManager = {

    /**
     * Initializes the diplomacy memory object if it doesn't exist.
     */
    init: function () {
        if (!Memory.diplomacy) {
            Memory.diplomacy = {
                players: {
                    'Invader': 'enemy',
                    'Source Keeper': 'enemy'
                }
            };
            console.log('[Diplomacy] Initialized diplomacy memory.');
        }
    },

    /**
     * Gets the diplomatic status of a player.
     * @param {string} username The player's username.
     * @returns {string} 'ally', 'neutral', or 'enemy'.
     */
    getStatus: function (username) {
        this.init();
        return Memory.diplomacy.players[username] || 'neutral';
    },

    /**
     * Sets the diplomatic status for a player.
     * @param {string} username The player's username.
     * @param {string} status The new status: 'ally', 'neutral', or 'enemy'.
     */
    setStatus: function (username, status) {
        this.init();
        if (['ally', 'neutral', 'enemy'].includes(status)) {
            Memory.diplomacy.players[username] = status;
            console.log(`[Diplomacy] Set ${username} to ${status}.`);
        }
    },

    /**
     * Periodically scans for hostile actions and updates player statuses.
     * This should be called from the main loop.
     */
    run: function () {
        if (Game.time % 100 !== 0) return;

        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            const events = room.getEventLog();
            const attackEvents = _.filter(events, { event: EVENT_ATTACK });

            attackEvents.forEach(event => {
                const target = Game.getObjectById(event.data.targetId);
                const attacker = Game.getObjectById(event.objectId);

                if (target && target.my && attacker && attacker.owner && this.getStatus(attacker.owner.username) !== 'ally') {
                    this.setStatus(attacker.owner.username, 'enemy');
                }
            });
        }
    }
};

module.exports = diplomacyManager;