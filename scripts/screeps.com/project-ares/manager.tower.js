const diplomacyManager = require('diplomacy');

const roleTowerManager = {
    /**
     * Runs the logic for all towers in a given room.
     * @param {Room} room The room to manage.
     */
    run: function (room) {
        const towers = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER }
        });

        for (let tower of towers) {
            // 1. Heal Critical Friendlies (Soldiers/Medics)
            let criticalCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: (c) => c.hits < c.hitsMax * 0.5 && (c.memory.role == 'soldier' || c.memory.role == 'medic')
            });
            if (criticalCreep) {
                tower.heal(criticalCreep);
                continue;
            }

            // 2. Attack Hostiles (that are not allies)
            let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                filter: (c) => diplomacyManager.getStatus(c.owner.username) !== 'ally'
            });
            if (closestHostile) {
                tower.attack(closestHostile);
                continue;
            }

            // 3. Repair Structures (Exclude walls to save energy for defense)
            // Only repair when energy is above 50% to conserve for combat
            if (tower.store[RESOURCE_ENERGY] > tower.store.getCapacity(RESOURCE_ENERGY) * 0.5) {
                let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART
                });
                if (closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                }
            }
        }
    }
};

module.exports = roleTowerManager;