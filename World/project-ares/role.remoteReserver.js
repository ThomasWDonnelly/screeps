var roleRemoteReserver = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var flag = Game.flags['Reserve'];
        if(flag) {
            if(creep.room.name !== flag.pos.roomName) {
                creep.moveToTarget(flag, '#ffffff');
                return;
            }
            
            if(creep.room.controller) {
                if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(creep.room.controller, '#ffffff');
                }
            }
        }
    }
};

module.exports = roleRemoteReserver;