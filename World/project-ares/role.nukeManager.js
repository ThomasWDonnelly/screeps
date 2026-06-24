var roleNukeManager = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // Recycle if no Ghodium in storage (and not carrying any)
        let source = creep.room.storage || creep.room.terminal;
        if (!creep.memory.hauling && source && (source.store[RESOURCE_GHODIUM] || 0) < 500 && creep.store[RESOURCE_GHODIUM] == 0 && creep.store[RESOURCE_ENERGY] == 0) {
             let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
             if (spawn) {
                 if (spawn.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                     creep.moveToTarget(spawn, '#ffffff');
                 }
             }
             return;
        }

        // State toggle
        if(creep.memory.hauling && creep.store.getUsedCapacity() == 0) {
            creep.memory.hauling = false;
            creep.say('🔄 collect');
        }
        if(!creep.memory.hauling && creep.store.getFreeCapacity() == 0) {
            creep.memory.hauling = true;
            creep.say('☢️ load');
        }

        let nuker = creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_NUKER } })[0];
        if (!nuker) return;

        if (creep.memory.hauling) {
            // Deliver to Nuker
            let resourceType = Object.keys(creep.store).find(r => creep.store[r] > 0);
            if (creep.transfer(nuker, resourceType) == ERR_NOT_IN_RANGE) {
                creep.moveToTarget(nuker, '#ff0000');
            }
        } else {
            // Collect Resources
            if (!source) return;

            // 1. Prioritize Ghodium (Capacity 5000)
            if (nuker.store.getFreeCapacity(RESOURCE_GHODIUM) > 0 && source.store[RESOURCE_GHODIUM] > 0) {
                if (creep.withdraw(source, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(source, '#ffaa00');
                }
                return;
            }

            // 2. Fill Energy (Capacity 300,000)
            if (nuker.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && source.store[RESOURCE_ENERGY] > 0) {
                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(source, '#ffaa00');
                }
            }
        }
    }
};
module.exports = roleNukeManager;