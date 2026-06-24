var roleRemoteManager = require('manager.remote');

var roleRemoteBuilder = {
    /** @param {Creep} creep **/
    run: function (creep) {
        roleRemoteManager.run(creep);
    }
};
module.exports = roleRemoteBuilder;