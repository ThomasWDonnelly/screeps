/**
 * Role: Observer Manager
 *
 * Automatically uses Observers to scan nearby rooms for strategic intel,
 * such as expansion opportunities, hostile presence, and valuable deposits.
 */
const observerManager = {
    /**
     * @param {Room} room The room containing the observer.
     */
    run: function (room) {
        // Observers are only available at RCL 8.
        if (room.controller.level < 8) {
            return;
        }

        const observer = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_OBSERVER }
        })[0];

        if (!observer) {
            return;
        }

        // Initialize memory for the observer logic.
        if (!room.memory.observer) {
            room.memory.observer = {
                queue: [],
                index: 0,
                lastObserved: null
            };
        }

        // 1. Analyze the previously observed room.
        const lastRoomName = room.memory.observer.lastObserved;
        const observedRoom = Game.rooms[lastRoomName];
        if (observedRoom) {
            this.analyzeRoom(observedRoom);
        }

        // 2. Populate the observation queue if it's empty.
        if (room.memory.observer.queue.length === 0) {
            const exits = Game.map.describeExits(room.name);
            room.memory.observer.queue = Object.values(exits);
            console.log(`[Observer] Repopulated observation queue for ${room.name}.`);
        }

        // 3. Observe the next room in the queue.
        const queue = room.memory.observer.queue;
        let index = room.memory.observer.index;

        if (index >= queue.length) {
            index = 0; // Loop back to the start.
        }

        const nextRoomName = queue[index];
        if (observer.observeRoom(nextRoomName) === OK) {
            room.memory.observer.lastObserved = nextRoomName;
            room.memory.observer.index = index + 1;
        }
    },

    /**
     * Gathers and stores intel about a given room in Memory.
     * @param {Room} room The room to analyze.
     */
    analyzeRoom: function (room) {
        if (!Memory.intel) Memory.intel = {};

        const controller = room.controller;
        Memory.intel[room.name] = {
            owner: controller && controller.owner ? controller.owner.username : null,
            reservation: controller && controller.reservation ? controller.reservation.username : null,
            rcl: controller && controller.level ? controller.level : 0,
            sources: room.find(FIND_SOURCES).length,
            minerals: room.find(FIND_MINERALS).map(m => m.mineralType),
            hostileTowers: room.find(FIND_HOSTILE_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }).length,
            lastScouted: Game.time
        };
        console.log(`[Observer] Intel gathered for room ${room.name}.`);
    }
};

module.exports = observerManager;