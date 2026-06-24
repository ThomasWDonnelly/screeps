const roomPlanner = {

    run: function (room) {
        // Run the planner periodically to save CPU.
        if (Game.time % 100 !== 0) {
            return;
        }

        const spawn = room.find(FIND_MY_SPAWNS)[0];
        if (!spawn) {
            return; // Can't plan without a spawn.
        }

        // Initialize memory for the planner.
        if (!room.memory.planner) {
            room.memory.planner = {};
        }

        this.planContainers(room, spawn);
        this.planRamparts(room);
        this.planRoads(room, spawn);
    },

    /** Plans and builds containers near energy sources. */
    planContainers: function (room, spawn) {
        if (!room.memory.planner.containersPlanned) {
            room.memory.planner.containersPlanned = {};
        }

        const sources = room.find(FIND_SOURCES);
        for (const source of sources) {
            // Check if we've already planned a container for this source.
            if (room.memory.planner.containersPlanned[source.id]) continue;

            const nearContainer = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType === STRUCTURE_CONTAINER }).length > 0;
            const nearSite = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, { filter: s => s.structureType === STRUCTURE_CONTAINER }).length > 0;

            if (!nearContainer && !nearSite) {
                console.log(`Planning container near source ${source.id}`);
                const path = spawn.pos.findPathTo(source, { ignoreCreeps: true, range: 1 });
                if (path.length > 0) {
                    const pos = path[path.length - 1];
                    room.createConstructionSite(pos.x, pos.y, STRUCTURE_CONTAINER);
                    room.memory.planner.containersPlanned[source.id] = true; // Mark as planned.
                }
            }
        }
    },

    /** Plans a perimeter wall with ramparts at key entry points. */
    planRamparts: function (room) {
        // This is a one-time, expensive operation.
        if (room.memory.planner.rampartsPlanned || room.controller.level < 4) {
            return;
        }

        console.log(`Planning defensive perimeter for room ${room.name}`);
        const terrain = new Game.Terrain(room.name);
        const wallDistance = 3; // How far from the edge to build the wall.

        for (let i = 0; i < 50; i++) {
            // Top and Bottom walls
            this.buildWallTile(room, i, wallDistance, terrain);
            this.buildWallTile(room, i, 49 - wallDistance, terrain);
            // Left and Right walls
            this.buildWallTile(room, wallDistance, i, terrain);
            this.buildWallTile(room, 49 - wallDistance, i, terrain);
        }

        room.memory.planner.rampartsPlanned = true;
    },

    /** Helper function to place a wall or rampart at a specific tile. */
    buildWallTile: function (room, x, y, terrain) {
        if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
            return; // Can't build on a wall.
        }

        const hasRoad = room.lookForAt(LOOK_STRUCTURES, x, y).some(s => s.structureType === STRUCTURE_ROAD);
        const structureType = hasRoad ? STRUCTURE_RAMPART : STRUCTURE_WALL;

        // Place construction site if the tile is clear.
        room.createConstructionSite(x, y, structureType);
    },

    /** Plans and builds a road network connecting the spawn to sources and the controller. */
    planRoads: function (room, spawn) {
        // This is a one-time operation to lay the main road network.
        if (room.memory.planner.roadsPlanned) return;

        console.log(`Planning primary road network for room ${room.name}`);
        const destinations = [
            room.controller,
            ...room.find(FIND_SOURCES)
        ];

        destinations.forEach(dest => {
            if (dest) {
                const path = spawn.pos.findPathTo(dest, { ignoreCreeps: true, range: 1 });
                path.forEach(step => {
                    room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
                });
            }
        });

        room.memory.planner.roadsPlanned = true;
    }
};

module.exports = roomPlanner;
