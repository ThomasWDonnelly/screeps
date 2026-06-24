var roleFactoryManager = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // Custom state toggle for resources
        if(creep.memory.hauling && creep.store.getUsedCapacity() == 0) {
            creep.memory.hauling = false;
            creep.say('🔄 collect');
        }
        if(!creep.memory.hauling && creep.store.getFreeCapacity() == 0) {
            creep.memory.hauling = true;
            creep.say('🚚 deliver');
        }

        let factory = creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_FACTORY } })[0];
        if (!factory) return;

        // Validate Factory Level against Target
        let targetCommodity = creep.room.memory.factoryTarget;
        if (targetCommodity && COMMODITIES[targetCommodity].level && COMMODITIES[targetCommodity].level !== factory.level) {
            // Factory level does not match commodity requirement
            targetCommodity = null;
        }

        if (creep.memory.hauling) {
            // DELIVERY LOGIC
            let resourceType = Object.keys(creep.store).find(r => creep.store[r] > 0);
            let target = creep.room.storage || creep.room.terminal;

            // If carrying energy and factory needs it, deliver to factory
            if (resourceType === RESOURCE_ENERGY && factory.store[RESOURCE_ENERGY] < 2000) {
                target = factory;
            }
            // If carrying ingredients for target production, deliver to factory
            else if (targetCommodity && COMMODITIES[targetCommodity]) {
                let components = COMMODITIES[targetCommodity].components;
                if (components[resourceType]) {
                    target = factory;
                }
            }

            if (target) {
                if (creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(target, '#ffffff');
                }
            }
        } else {
            // COLLECTION LOGIC
            // 1. Empty Factory of products (anything not energy or needed components)
            let product = Object.keys(factory.store).find(r => {
                if (r === RESOURCE_ENERGY) return false;
                if (targetCommodity && COMMODITIES[targetCommodity]) {
                    if (COMMODITIES[targetCommodity].components[r]) return false;
                }
                return true;
            });

            if (product) {
                if (creep.withdraw(factory, product) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(factory, '#ffaa00');
                }
                return;
            }

            // 2. Fill Factory with Energy
            if (factory.store[RESOURCE_ENERGY] < 2000) {
                let source = creep.room.storage || creep.room.terminal;
                if (source && source.store[RESOURCE_ENERGY] > 0) {
                    if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveToTarget(source, '#ffaa00');
                    }
                    return;
                }
            }

            // 3. Fill Factory with Ingredients
            if (targetCommodity && COMMODITIES[targetCommodity]) {
                let components = COMMODITIES[targetCommodity].components;
                for (let comp in components) {
                    if (factory.store[comp] < components[comp] * 5) { // Buffer
                        let source = creep.room.storage || creep.room.terminal;
                        if (source && source.store[comp] > 0) {
                            if (creep.withdraw(source, comp) == ERR_NOT_IN_RANGE) {
                                creep.moveToTarget(source, '#ffaa00');
                            }
                            return;
                        }
                    }
                }
            }
        }
    },

    runFactory: function(room) {
        let factory = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_FACTORY } })[0];
        if (!factory || factory.cooldown > 0) return;

        let target = room.memory.factoryTarget;
        if (target && COMMODITIES[target]) {
            // Check level requirement
            if (COMMODITIES[target].level && COMMODITIES[target].level !== factory.level) return;

            if (factory.store.getFreeCapacity() > 0) {
                factory.produce(target);
            }
        }
    }
};
module.exports = roleFactoryManager;