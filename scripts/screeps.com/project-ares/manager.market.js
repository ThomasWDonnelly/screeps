var roleMarketManager = {
    run: function() {
        // Run every 10 ticks to save CPU
        if (Game.time % 10 !== 0) return;

        // Configuration
        const SELL_THRESHOLD = 20000;
        const BUY_THRESHOLDS = {
            [RESOURCE_ENERGY]: 50000,
            [RESOURCE_GHODIUM]: 1000
        };
        const MAX_BUY_PRICE = {
            [RESOURCE_ENERGY]: 0.5,
            [RESOURCE_GHODIUM]: 1.5
        };

        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            let terminal = room.terminal;

            if (terminal && terminal.my && terminal.cooldown === 0) {
                // 1. Sell Excess Resources
                for (let resourceType in terminal.store) {
                    if (resourceType === RESOURCE_ENERGY) continue; // Don't sell energy blindly

                    let amount = terminal.store[resourceType];
                    
                    if (amount > SELL_THRESHOLD) {
                        let amountToSell = amount - SELL_THRESHOLD;
                        
                        // Find buyers
                        let orders = Game.market.getAllOrders(order => 
                            order.resourceType === resourceType && 
                            order.type === ORDER_BUY && 
                            order.remainingAmount > 0
                        );

                        if (orders.length > 0) {
                            // Sort by price descending
                            orders.sort((a, b) => b.price - a.price);
                            let bestOrder = orders[0];
                            
                            let dealAmount = Math.min(amountToSell, bestOrder.remainingAmount);
                            let cost = Game.market.calcTransactionCost(dealAmount, room.name, bestOrder.roomName);
                            
                            if (terminal.store[RESOURCE_ENERGY] >= cost) {
                                if (Game.market.deal(bestOrder.id, dealAmount, room.name) === OK) {
                                    console.log(`MarketManager: Sold ${dealAmount} ${resourceType} from ${room.name} at ${bestOrder.price}`);
                                    return; // One deal per terminal per tick
                                }
                            }
                        }
                    }
                }

                // 2. Buy Needed Resources
                for (let resourceType in BUY_THRESHOLDS) {
                    let currentAmount = terminal.store[resourceType] || 0;
                    if (currentAmount < BUY_THRESHOLDS[resourceType]) {
                        if (Game.market.credits < 10000) continue; // Credit safety

                        let orders = Game.market.getAllOrders(order => 
                            order.resourceType === resourceType &&
                            order.type === ORDER_SELL &&
                            order.remainingAmount > 0 &&
                            order.price <= (MAX_BUY_PRICE[resourceType] || 100)
                        );

                        if (orders.length > 0) {
                            orders.sort((a, b) => a.price - b.price); // Cheapest first
                            let bestOrder = orders[0];
                            
                            let amountNeeded = BUY_THRESHOLDS[resourceType] - currentAmount;
                            let dealAmount = Math.min(amountNeeded, bestOrder.remainingAmount, 5000); // Cap buy amount
                            let cost = Game.market.calcTransactionCost(dealAmount, room.name, bestOrder.roomName);

                            if (terminal.store[RESOURCE_ENERGY] >= cost) {
                                if (Game.market.deal(bestOrder.id, dealAmount, room.name) === OK) {
                                    console.log(`MarketManager: Bought ${dealAmount} ${resourceType} for ${room.name} at ${bestOrder.price}`);
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
module.exports = roleMarketManager;