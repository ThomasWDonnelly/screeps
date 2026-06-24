var roleDepositMiner = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var flag = Game.flags['Deposit'];
        if(!flag) return;

        if(creep.room.name !== flag.pos.roomName) {
            creep.moveToTarget(flag, '#ffffff');
            return;
        }

        var deposit = creep.pos.findClosestByRange(FIND_DEPOSITS);
        if(deposit) {
            if(creep.harvest(deposit) == ERR_NOT_IN_RANGE) {
                creep.moveToTarget(deposit, '#ffaa00');
            } else {
                // Drop resources if full (Haulers will pick up)
                if (creep.store.getFreeCapacity() === 0) {
                    for(const resourceType in creep.store) {
                        creep.drop(resourceType);
                    }
                }
            }
        }
    }
};
module.exports = roleDepositMiner;