/**
 * debugLog
 *
 * @param {string} type
 * @param  {...string} messages
 */
function debugLog(type, ...messages) {
    if (global.config && global.config.debug && global.config.debug[type]) {
        console.log(`${Game.time} ${type.padEnd(27)} ${messages.join(' ')}`);
    }
}

module.exports.debugLog = debugLog;

Room.prototype.log = function (...messages) {
    console.log(`${Game.time} ${this.name.padEnd(27)} ${messages.join(' ')}`);
};

Room.prototype.debugLog = function (type, ...messages) {
    if (global.config && global.config.debug && global.config.debug[type]) {
        this.log(type, ...messages);
    }
};

RoomObject.prototype.log = function (...messages) {
    const name = this.name || this.structureType;
    console.log(`${Game.time} ${(this.room ? this.room.name : 'N/A').padEnd(6)} ${name.padEnd(20)} ${this.pos} ${messages.join(' ')}`);
};

RoomPosition.prototype.log = function (...messages) {
    const coords = ('[' + this.x + ',' + this.y + ']').padEnd(20);
    console.log(`${Game.time} ${this.roomName.padEnd(6)} ${coords} ${messages.join(' ')}`);
};
/*
 * Log creep message based on debug config
 *
 * `config.debug.creepLog.roles` and `config.debug.creepLog.rooms` define
 * logging on common methods
 *
 * @param messages The message to log
 */
Creep.prototype.creepLog = function (...messages) {
    if (!global.config || !global.config.debug || !global.config.debug.creepLog) return;

    if (global.config.debug.creepLog.roles !== '*' && global.config.debug.creepLog.roles.indexOf(this.memory.role) < 0) {
        return;
    }
    if (global.config.debug.creepLog.rooms !== '*' && global.config.debug.creepLog.rooms.indexOf(this.room.name) < 0) {
        return;
    }
    this.log(...messages);
};
