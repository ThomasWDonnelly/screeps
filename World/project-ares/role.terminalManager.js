var roleTerminalManager = {
    run: function() {
        // Iterate over all rooms with a terminal
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            let terminal = room.terminal;

            // Check if terminal exists, is ours, and is ready
            if (terminal && terminal.my && terminal.cooldown === 0) {
                
                let sent = false;

                // 1. Balance Energy
                // Threshold: Keep 10,000 energy locally for costs/emergency
                if (terminal.store[RESOURCE_ENERGY] > 10000) {
                    
                    // Find a room with low energy (< 5000)
                    let targetRoom = _.find(Game.rooms, (r) => 
                        r.name !== room.name && 
                        r.terminal && r.terminal.my && 
                        r.terminal.store[RESOURCE_ENERGY] < 5000
                    );

                    if (targetRoom) {
                        let amount = 2000;
                        let cost = Game.market.calcTransactionCost(amount, room.name, targetRoom.name);
                        if (terminal.store[RESOURCE_ENERGY] >= amount + cost) {
                            terminal.send(RESOURCE_ENERGY, amount, targetRoom.name);
                            console.log(`TerminalManager: Sending ${amount} energy from ${room.name} to ${targetRoom.name}`);
                            sent = true;
                        }
                    }
                }

                if (sent) continue;

                // 2. Balance Minerals (Based on Storage levels)
                if (room.storage) {
                    for (let resourceType in room.storage.store) {
                        if (resourceType === RESOURCE_ENERGY) continue;

                        // If we have a surplus in Storage (> 10000)
                        if (room.storage.store[resourceType] > 10000) {
                            // Check if we have enough in Terminal to send (> 1000)
                            if (terminal.store[resourceType] >= 1000) {
                                // Find a room with a deficit in Storage (< 5000)
                                let targetRoom = _.find(Game.rooms, (r) => 
                                    r.name !== room.name && 
                                    r.terminal && r.terminal.my && r.storage &&
                                    (r.storage.store[resourceType] || 0) < 5000
                                );

                                if (targetRoom) {
                                    let amount = 1000;
                                    let cost = Game.market.calcTransactionCost(amount, room.name, targetRoom.name);
                                    // Check if we have energy for the transfer
                                    if (terminal.store[RESOURCE_ENERGY] >= cost) {
                                        terminal.send(resourceType, amount, targetRoom.name);
                                        console.log(`TerminalManager: Sending ${amount} ${resourceType} from ${room.name} to ${targetRoom.name}`);
                                        sent = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
module.exports = roleTerminalManager;