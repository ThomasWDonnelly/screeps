/**
 * Role: Construction Manager
 *
 * Manages automated construction tasks for a room, such as building roads,
 * extensions, containers, and extractors. Runs periodically to save CPU.
 */
const constructionManager = {
    /**
     * @param {Room} room The room to manage.
     */
    run: function (room) {
        // Run manager periodically to save CPU.
        if (Game.time % 100 !== 0) {
            return;
        }

        const spawn = room.find(FIND_MY_SPAWNS)[0];
        if (!spawn) return; // Requires a spawn to reference positions.

        this.buildInitialRoads(room, spawn);
        this.buildControllerRoads(room, spawn);
        this.buildExtensions(room, spawn);
        this.buildContainers(room, spawn);
        this.buildExtractor(room, spawn);
    },

    buildInitialRoads: function (room, spawn) {
        if (room.find(FIND_CONSTRUCTION_SITES).length == 0) {
            let sources = room.find(FIND_SOURCES);
            if (sources.length > 0) {
                let path = spawn.pos.findPathTo(sources[0], { ignoreCreeps: true });
                if (path.length > 0) {
                    let midPoint = path[Math.floor(path.length / 2)];
                    room.createConstructionSite(midPoint.x, midPoint.y, STRUCTURE_ROAD);
                }
            }
        }
    },

    buildControllerRoads: function (room, spawn) {
        if (Game.time % 1000 === 0) { // Check less frequently
            let path = spawn.pos.findPathTo(room.controller, { ignoreCreeps: true });
            for (let i = 0; i < path.length; i++) {
                room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
            }
        }
    },

    buildExtensions: function (room, spawn) {
        if (room.controller.level >= 2) {
            let extensions = room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_EXTENSION }
            });
            let sites = room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: { structureType: STRUCTURE_EXTENSION }
            });

            if (extensions.length + sites.length < CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller.level]) {
                for (let x = -5; x <= 5; x++) {
                    for (let y = -5; y <= 5; y++) {
                        let checkX = spawn.pos.x + x;
                        let checkY = spawn.pos.y + y;

                        if ((x + y) % 2 !== 0) continue;

                        if (room.createConstructionSite(checkX, checkY, STRUCTURE_EXTENSION) === OK) {
                            x = 10; y = 10; // Break loops
                        }
                    }
                }
            }
        }
    },

    buildContainers: function (room, spawn) {
        if (Game.time % 500 === 0) { // Check less frequently
            let sources = room.find(FIND_SOURCES);
            for (let source of sources) {
                let containers = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_CONTAINER } });
                if (containers.length === 0) {
                    let sites = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, { filter: { structureType: STRUCTURE_CONTAINER } });
                    if (sites.length === 0) {
                        let miner = source.pos.findInRange(FIND_MY_CREEPS, 1, { filter: (c) => c.memory.role == 'miner' })[0];
                        if (miner) {
                            room.createConstructionSite(miner.pos, STRUCTURE_CONTAINER);
                        } else {
                            let path = spawn.pos.findPathTo(source, { ignoreCreeps: true, range: 1 });
                            if (path.length > 0) {
                                let lastStep = path[path.length - 1];
                                room.createConstructionSite(lastStep.x, lastStep.y, STRUCTURE_CONTAINER);
                            }
                        }
                    }
                }
            }
        }
    },

    buildExtractor: function (room, spawn) {
        if (Game.time % 1000 === 0 && room.controller.level >= 6) { // Check less frequently
            let minerals = room.find(FIND_MINERALS);
            for (let mineral of minerals) {
                let hasExtractor = mineral.pos.lookFor(LOOK_STRUCTURES).some(s => s.structureType == STRUCTURE_EXTRACTOR);
                let hasSite = mineral.pos.lookFor(LOOK_CONSTRUCTION_SITES).some(s => s.structureType == STRUCTURE_EXTRACTOR);
                if (!hasExtractor && !hasSite) {
                    room.createConstructionSite(mineral.pos, STRUCTURE_EXTRACTOR);
                }
            }
        }
    }
};

module.exports = constructionManager;