/*
 * The Squad Manager is the high-level controller for military operations.
 * It reads flags, assigns creeps to squads, and dictates squad-level objectives.
 *
 * Squad Flag Naming Convention: `squad_[action]_[squadName]`
 * Examples:
 *   - `squad_attack_alpha`:  The 'alpha' squad will move to this flag and attack hostiles.
 *   - `squad_rally_alpha`:   The 'alpha' squad will gather at this flag's position.
 */
const squadManager = {

    run: function () {
        if (!Memory.squads) {
            Memory.squads = {};
        }

        this.assignCreepsToSquads();
        this.runSquads();
    },

    // Assign unassigned military creeps to squads that have open slots.
    assignCreepsToSquads: function () {
        const militaryCreeps = _.filter(Game.creeps, c =>
            (c.memory.role === 'soldier' || c.memory.role === 'medic') && !c.memory.squad
        );

        for (const creep of militaryCreeps) {
            // This is a simple assignment logic. It could be expanded to look for specific squad needs.
            for (const squadName in Memory.squads) {
                const squad = Memory.squads[squadName];
                // A more advanced system would check composition (e.g., max 2 medics).
                if (squad.members.length < (squad.maxSize || 4)) {
                    creep.memory.squad = squadName;
                    squad.members.push(creep.id);
                    console.log(`Assigned ${creep.name} (${creep.memory.role}) to squad '${squadName}'`);
                    break;
                }
            }
        }
    },

    // Main logic loop for managing all squads.
    runSquads: function () {
        const squadFlags = _.filter(Game.flags, f => f.name.startsWith('squad_'));

        // Update squad states based on flags
        for (const flag of squadFlags) {
            const parts = flag.name.split('_');
            const action = parts[1];
            const squadName = parts[2];

            // Initialize squad in memory if it doesn't exist
            if (!Memory.squads[squadName]) {
                Memory.squads[squadName] = {
                    name: squadName,
                    members: [],
                    state: 'rallying',
                    maxSize: 4 // Example size, could be configured per squad
                };
            }

            const squad = Memory.squads[squadName];
            squad.action = action;
            squad.flagName = flag.name;

            // Clean up dead creeps from squad list
            squad.members = squad.members.filter(id => Game.getObjectById(id));

            // Determine squad state
            this.updateSquadState(squad, flag);
        }
    },

    // Determine what a squad should be doing based on its flag and environment.
    updateSquadState: function (squad, flag) {
        if (!flag) {
            squad.state = 'idle';
            return;
        }

        if (squad.action === 'attack') {
            squad.state = 'attacking';
        } else { // rally, defend, etc.
            squad.state = 'rallying';
        }
    }
};

module.exports = squadManager;