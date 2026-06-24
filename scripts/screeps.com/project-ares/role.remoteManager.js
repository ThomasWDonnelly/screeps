var roleRemoteManager = {
    /** @param {Creep} creep **/
    run: function(creep) {
        creep.checkEnergyState('working', '🛠️ work', '🔄 harvest');

        var flag = Game.flags['Remote'];
        if(!flag) return;

        if(creep.room.name !== flag.pos.roomName) {
            creep.moveToTarget(flag, '#ffffff');
            return;
        }

        if(creep.memory.working) {
            // 1. Critical Repairs (Containers/Roads decaying)
            var criticalStructures = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.hits < s.hitsMax) || 
                               (s.structureType == STRUCTURE_ROAD && s.hits < s.hitsMax * 0.5)
            });

            if(criticalStructures.length > 0) {
                var target = creep.pos.findClosestByRange(criticalStructures);
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(target, '#ffffff');
                }
                return;
            }

            // 2. Build Construction Sites
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(targets[0], '#ffffff');
                }
            } else {
                // 3. Repair Structures
                var structures = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
                });
                if(structures.length > 0) {
                    if(creep.repair(structures[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(structures[0], '#ffffff');
                    }
                }
            }
        } else {
            // Harvest in remote room
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if(source) {
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(source, '#ffaa00');
                }
            }
        }
    }
};
module.exports = roleRemoteManager;