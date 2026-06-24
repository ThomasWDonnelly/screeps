var roleRemoteScout = {
    /** @param {Creep} creep **/
    run: function(creep) {
        // If Remote flag already exists, our job is done. Recycle to save CPU/Bucket.
        if (Game.flags['Remote']) {
            let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            if (spawn) {
                if (spawn.recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(spawn, '#ffffff');
                }
            }
            return;
        }

        // 1. Pick a target room if not set
        if (!creep.memory.targetRoom) {
            // Pick a random exit to explore
            let exits = Game.map.describeExits(creep.room.name);
            let directions = Object.keys(exits);
            let direction = directions[Math.floor(Math.random() * directions.length)];
            creep.memory.targetRoom = exits[direction];
        }

        // 2. Move to target room
        if (creep.room.name !== creep.memory.targetRoom) {
            let exitDir = creep.room.findExitTo(creep.memory.targetRoom);
            let exit = creep.pos.findClosestByRange(exitDir);
            creep.moveToTarget(exit, '#ffffff');
        } else {
            // 3. Analyze Room
            let sources = creep.room.find(FIND_SOURCES);
            let controller = creep.room.controller;
            
            // Check safety: Not owned/reserved by enemy, no dangerous hostiles
            let isSafe = true;
            if (controller) {
                if (controller.owner && controller.owner.username !== creep.owner.username) isSafe = false;
                if (controller.reservation && controller.reservation.username !== creep.owner.username) isSafe = false;
            }
            
            let hostiles = creep.room.find(FIND_HOSTILE_CREEPS, {
                filter: (c) => c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0
            });
            if (hostiles.length > 0) isSafe = false;

            if (isSafe && sources.length > 0) {
                // Check if we can claim this room (GCL > Owned Rooms)
                let myRooms = _.filter(Game.rooms, r => r.controller && r.controller.my).length;
                
                if (Game.gcl.level > myRooms && controller) {
                    // We can claim! Place Claim flag.
                    Game.flags['Claim'] ? Game.flags['Claim'].setPosition(controller.pos) : creep.room.createFlag(controller.pos, 'Claim', COLOR_GREEN);
                    console.log('RemoteScout found room to CLAIM: ' + creep.room.name);
                } else {
                    // Standard Remote Mining setup
                    // Found a suitable room! Place flag at the first source.
                    creep.room.createFlag(sources[0].pos, 'Remote', COLOR_YELLOW);
                    
                    // Place Reserve flag on controller
                    if (controller) {
                        // If flag exists, move it; otherwise create it
                        Game.flags['Reserve'] ? Game.flags['Reserve'].setPosition(controller.pos) : creep.room.createFlag(controller.pos, 'Reserve', COLOR_PURPLE);
                    }
    
                    console.log('RemoteScout found suitable room: ' + creep.room.name + '. Flags placed.');
                }
            } else {
                // Not suitable, pick next room
                delete creep.memory.targetRoom;
            }
        }
    }
};
module.exports = roleRemoteScout;