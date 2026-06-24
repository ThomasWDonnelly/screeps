var helpers = require('helpers');

var roleLabManager = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // Auto-detect config if missing
        if (!creep.room.memory.labConfig) {
            helpers.detectLabConfig(creep.room);
        }

        // Custom state toggle for minerals (checkEnergyState is for energy only)
        if(creep.memory.hauling && creep.store.getUsedCapacity() == 0) {
            creep.memory.hauling = false;
            creep.say('🔄 collect');
        }
        if(!creep.memory.hauling && creep.store.getFreeCapacity() == 0) {
            creep.memory.hauling = true;
            creep.say('🚚 deliver');
        }

        if (creep.memory.hauling) {
            // DELIVERY LOGIC
            let carryType = Object.keys(creep.store).find(r => creep.store[r] > 0);
            let target = null;

            // 1. Check if carrying ingredients for Input Labs
            if (creep.room.memory.labConfig && creep.room.memory.targetReaction) {
                let ingredients = helpers.getReactionIngredients(creep.room.memory.targetReaction);
                if (ingredients) {
                    let input1 = Game.getObjectById(creep.room.memory.labConfig.input1);
                    let input2 = Game.getObjectById(creep.room.memory.labConfig.input2);

                    if (carryType == ingredients[0] && input1 && input1.store.getFreeCapacity(carryType) > 0) {
                        target = input1;
                    } else if (carryType == ingredients[1] && input2 && input2.store.getFreeCapacity(carryType) > 0) {
                        target = input2;
                    }
                }
            }

            // 2. Default to Storage
            if (!target) {
                target = creep.room.storage;
            }

            if (target) {
                if (creep.transfer(target, carryType) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(target, '#ffffff');
                }
            }
        } else {
            // COLLECTION LOGIC
            let actionTaken = false;
            let excludeIds = [];

            // 1. Fill Input Labs (Priority)
            if (creep.room.memory.labConfig && creep.room.memory.targetReaction) {
                let ingredients = helpers.getReactionIngredients(creep.room.memory.targetReaction);
                if (ingredients) {
                    let input1 = Game.getObjectById(creep.room.memory.labConfig.input1);
                    let input2 = Game.getObjectById(creep.room.memory.labConfig.input2);
                    
                    if (input1) excludeIds.push(input1.id);
                    if (input2) excludeIds.push(input2.id);

                    let source = creep.room.storage || creep.room.terminal;
                    if (source) {
                        // Check Input 1
                        if (input1 && input1.store[ingredients[0]] < 2000 && source.store[ingredients[0]] > 0) {
                            if (creep.withdraw(source, ingredients[0]) == ERR_NOT_IN_RANGE) {
                                creep.moveToTarget(source, '#ffaa00');
                            }
                            actionTaken = true;
                        }
                        // Check Input 2
                        else if (input2 && input2.store[ingredients[1]] < 2000 && source.store[ingredients[1]] > 0) {
                            if (creep.withdraw(source, ingredients[1]) == ERR_NOT_IN_RANGE) {
                                creep.moveToTarget(source, '#ffaa00');
                            }
                            actionTaken = true;
                        }
                    }
                }
            }

            if (actionTaken) return;

            // 2. Empty Output Labs
            var labs = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LAB && s.mineralType
            });

            var targetLab = creep.pos.findClosestByRange(labs, {
                filter: (l) => l.store[l.mineralType] > 500 && !excludeIds.includes(l.id)
            });

            if (targetLab) {
                if (creep.withdraw(targetLab, targetLab.mineralType) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(targetLab, '#ffaa00');
                }
            } else {
                // 3. Idle / Help with Energy
                if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
                    var energyLab = creep.pos.findClosestByRange(labs, { filter: (l) => l.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
                    if (energyLab) {
                        if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveToTarget(creep.room.storage, '#ffaa00');
                        }
                    }
                }
            }
        }
    },

    /** 
     * Execute lab reactions for the room
     * @param {Room} room 
     */
    runLabs: function(room) {
        if (room.controller.level < 6) return;

        // Check for Memory Config
        // Structure: room.memory.labConfig = { input1: ID, input2: ID, outputs: [ID, ID] }
        if (room.memory.labConfig && room.memory.labConfig.input1 && room.memory.labConfig.input2 && Array.isArray(room.memory.labConfig.outputs)) {
            let input1 = Game.getObjectById(room.memory.labConfig.input1);
            let input2 = Game.getObjectById(room.memory.labConfig.input2);
            
            if (input1 && input2) {
                for (let outputId of room.memory.labConfig.outputs) {
                    let outputLab = Game.getObjectById(outputId);
                    if (outputLab && outputLab.cooldown == 0) {
                        outputLab.runReaction(input1, input2);
                    }
                }
            }
            return;
        }

        var labs = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_LAB }
        });

        if (labs.length < 3) return; // Need at least 3 labs for a reaction chain

        // Simple Auto-Reaction: 
        // Assume first 2 labs are inputs (should be filled manually or by advanced logic)
        // Assume remaining labs are outputs
        // This is a basic implementation. Advanced setups require Memory config.
        
        for (let i = 2; i < labs.length; i++) {
            let outputLab = labs[i];
            // Try to run reaction using the first two labs as inputs
            if (outputLab.cooldown == 0) {
                outputLab.runReaction(labs[0], labs[1]);
            }
        }
    }
};

module.exports = roleLabManager;