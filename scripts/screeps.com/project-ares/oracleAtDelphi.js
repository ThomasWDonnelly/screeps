/**
 * Module: Oracle at Delphi
 * 
 * Generates and manages long-term strategic goals, or "prophecies," for the AI.
 * These prophecies provide high-level direction, such as economic targets or military campaigns.
 */
const oracleManager = {
    /**
     * The Oracle speaks periodically to issue or check on prophecies.
     */
    run: function () {
        // The Oracle only speaks once every 1000 ticks to conserve its power (and CPU).
        if (Game.time % 1000 !== 0) {
            return;
        }

        if (!Memory.oracle) {
            Memory.oracle = {};
        }

        // Check if the current prophecy is fulfilled.
        if (Memory.oracle.prophecy) {
            if (this.isProphecyFulfilled(Memory.oracle.prophecy)) {
                console.log(`[Oracle] Prophecy fulfilled: ${this.getProphecyText(Memory.oracle.prophecy)}`);
                delete Memory.oracle.prophecy;
            } else {
                // The prophecy is ongoing.
                return;
            }
        }

        // If no prophecy, the Oracle will issue a new one.
        this.issueNewProphecy();
    },

    /**
     * Generates a new prophecy based on the current state of the game.
     */
    issueNewProphecy: function () {
        const prophecyTypes = ['GCL', 'CONQUEST', 'STOCKPILE'];
        const chosenType = prophecyTypes[Math.floor(Math.random() * prophecyTypes.length)];

        let prophecy = null;

        switch (chosenType) {
            case 'GCL':
                prophecy = {
                    type: 'GCL',
                    target: Game.gcl.level + 1,
                    issued: Game.time
                };
                break;

            case 'CONQUEST':
                const enemies = Object.keys(Memory.diplomacy.players).filter(p => Memory.diplomacy.players[p] === 'enemy' && !['Invader', 'Source Keeper'].includes(p));
                if (enemies.length > 0) {
                    prophecy = {
                        type: 'CONQUEST',
                        target: enemies[0], // Target the first declared enemy
                        issued: Game.time
                    };
                }
                break;

            case 'STOCKPILE':
                const minerals = [RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST];
                prophecy = {
                    type: 'STOCKPILE',
                    target: {
                        resource: minerals[Math.floor(Math.random() * minerals.length)],
                        amount: 50000
                    },
                    issued: Game.time
                };
                break;
        }

        if (prophecy) {
            Memory.oracle.prophecy = prophecy;
            console.log(`[Oracle] A new prophecy is declared: ${this.getProphecyText(prophecy)}`);
        }
    },

    /**
     * Checks if the conditions of the current prophecy have been met.
     * @param {object} prophecy The prophecy object from memory.
     * @returns {boolean} True if the prophecy is fulfilled.
     */
    isProphecyFulfilled: function (prophecy) {
        switch (prophecy.type) {
            case 'GCL':
                return Game.gcl.level >= prophecy.target;
            case 'CONQUEST':
                // Fulfilled if the target player owns no more rooms.
                return !Object.values(Game.rooms).some(r => r.controller && r.controller.owner && r.controller.owner.username === prophecy.target);
            case 'STOCKPILE':
                const totalAmount = _.sum(Object.values(Game.rooms), r => r.storage ? r.storage.store[prophecy.target.resource] || 0 : 0);
                return totalAmount >= prophecy.target.amount;
        }
        return false;
    },

    /**
     * Returns a human-readable string for a prophecy.
     * @param {object} prophecy The prophecy object.
     */
    getProphecyText: function (prophecy) {
        switch (prophecy.type) {
            case 'GCL': return `The empire shall expand to new horizons (Reach GCL ${prophecy.target}).`;
            case 'CONQUEST': return `The reign of ${prophecy.target} must come to an end.`;
            case 'STOCKPILE': return `A great reserve of ${prophecy.target.resource} (${prophecy.target.amount}) must be gathered.`;
            default: return "An unknown future awaits.";
        }
    }
};

module.exports = oracleManager;