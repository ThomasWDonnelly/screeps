var roleRemoteManager = require('role.remoteManager');

var roleRemoteBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        roleRemoteManager.run(creep);
    }
};
module.exports = roleRemoteBuilder;