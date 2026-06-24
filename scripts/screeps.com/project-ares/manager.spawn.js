let nameRegistry = require('registryOfNames');

const spawnManager = {
    run: function (spawn, roleCounts) {
        // Helper to get role count, defaulting to 0
        const getCount = (role) => roleCounts[role] || 0;

        if (spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            // Record spawn time for post-mortem analysis
            if (!spawningCreep.memory.spawnTime) {
                spawningCreep.memory.spawnTime = Game.time;
            }
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                { align: 'left', opacity: 0.8 });
            return;
        }

        // 0. Priority: Resurrection
        for (let name in Memory.creeps) {
            if (Memory.creeps[name].resurrecting && !Game.creeps[name]) {
                let role = Memory.creeps[name].role;
                let body = this.getCreepBody(spawn.room, role);

                // Remove the flag from memory before spawning so it's clean on the new creep
                delete Memory.creeps[name].resurrecting;

                if (spawn.spawnCreep(body, name, { memory: Memory.creeps[name] }) === OK) {
                    console.log('SpawnManager: Resurrecting ' + name);
                    return;
                }
            }
        }

        // Prophecy-Driven Spawning
        const prophecy = Memory.oracle ? Memory.oracle.prophecy : null;
        if (prophecy && prophecy.type === 'STOCKPILE') {
            const targetResource = prophecy.target.resource;

            // Is the target a raw mineral we can mine in this room?
            const mineral = spawn.room.find(FIND_MINERALS)[0];
            if (mineral && mineral.mineralType === targetResource) {
                const hasExtractor = mineral.pos.lookFor(LOOK_STRUCTURES).some(s => s.structureType === STRUCTURE_EXTRACTOR);
                if (hasExtractor) {
                    // Prioritize a dedicated miner for the prophecy resource
                    const mineralMiners = _.filter(Game.creeps, c => c.memory.role === 'miner' && c.memory.targetMineral === targetResource);
                    if (mineralMiners.length < 1) {
                        let newName = this.getNameFromRegistry('philosophersNames');
                        console.log(`[Prophecy] Spawning miner for ${targetResource}: ${newName}`);
                        spawn.spawnCreep(this.getCreepBody(spawn.room, 'miner'), newName, {
                            memory: { role: 'miner', targetMineral: targetResource }
                        });
                        return; // Prioritize this spawn
                    }
                }
            }
        }


        // Auto-Spawn Creeps if less than n
        if (getCount('harvester') < 4) {
            let newName = this.getNameFromRegistry('genericNames');
            console.log('Spawning new harvester: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'harvester'), newName,
                { memory: { role: 'harvester' } });
        } else if (getCount('miner') < 4) {
            let newName = this.getNameFromRegistry('genericNames');
            console.log('Spawning new miner: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'miner'), newName,
                { memory: { role: 'miner' } });
        } else if (getCount('hauler') < 4 && getCount('miner') > 0) {
            let newName = this.getNameFromRegistry('genericNames');
            console.log('Spawning new hauler: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'hauler'), newName,
                { memory: { role: 'hauler' } });
        } else if (getCount('upgrader') < 4) {
            let newName = this.getNameFromRegistry('philosophersNames');
            console.log('Spawning new upgrader: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'upgrader'), newName,
                { memory: { role: 'upgrader' } });
        } else if (getCount('repairer') < 2) {
            let newName = this.getNameFromRegistry('builderArchitectNames');
            console.log('Spawning new repairer: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'repairer'), newName,
                { memory: { role: 'repairer' } });
        } else if (getCount('wallRepairer') < 1) {
            const targets = spawn.room.find(FIND_STRUCTURES, {
                filter: (object) => (object.structureType == STRUCTURE_WALL || object.structureType == STRUCTURE_RAMPART) && object.hits < global.config.settings.wallTargetHits
            });
            if (targets.length > 0) {
                let newName = this.getNameFromRegistry('builderArchitectNames');
                console.log('Spawning new wallRepairer: ' + newName);
                spawn.spawnCreep(this.getCreepBody(spawn.room, 'wallRepairer'), newName,
                    { memory: { role: 'wallRepairer' } });
            }
        } else if (getCount('builder') < 6 && spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            let newName = this.getNameFromRegistry('builderArchitectNames');
            console.log('Spawning new builder: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'builder'), newName,
                { memory: { role: 'builder' } });
        } else if (getCount('soldier') < 15) {
            let newName = this.getNameFromRegistry('militaryNames');
            console.log('Spawning new soldier: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'soldier'), newName,
                { memory: { role: 'soldier' } });
        } else if (getCount('medic') < 4 && getCount('soldier') >= 2) {
            let newName = this.getNameFromRegistry('healerDoctorNames');
            console.log('Spawning new medic: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'medic'), newName,
                { memory: { role: 'medic' } });
        } else if (getCount('demolisher') < 1 && Game.flags['Demolish']) {
            let newName = this.getNameFromRegistry('militaryNames');
            console.log('Spawning new demolisher: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'demolisher'), newName,
                { memory: { role: 'demolisher' } });
        } else if (getCount('dismantler') < 1 && Game.flags['Breach']) {
            let newName = this.getNameFromRegistry('builderArchitectNames');
            console.log('Spawning new dismantler: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'dismantler'), newName,
                { memory: { role: 'dismantler' } });
        } else if (getCount('distributor') < 1 && spawn.room.terminal) {
            let needsDistribution = false;
            for (let resourceType in spawn.room.terminal.store) {
                if (spawn.room.terminal.store[resourceType] > 3000) {
                    needsDistribution = true;
                    break;
                }
            }
            if (needsDistribution) {
                let newName = this.getNameFromRegistry('genericNames');
                console.log('Spawning new distributor: ' + newName);
                spawn.spawnCreep(this.getCreepBody(spawn.room, 'distributor'), newName,
                    { memory: { role: 'distributor' } });
            }
        } else if (getCount('claimer') < 1 && Game.flags['Claim']) {
            let newName = this.getNameFromRegistry('diplomatEnvoyNames');
            console.log('Spawning new claimer: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'claimer'), newName,
                { memory: { role: 'claimer' } });
        } else if (getCount('bigClaimer') < 1 && Game.flags['Reserve']) {
            let newName = this.getNameFromRegistry('diplomatEnvoyNames');
            console.log('Spawning new bigClaimer: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'bigClaimer'), newName,
                { memory: { role: 'bigClaimer' } });
        } else if (getCount('remoteReserver') < 1 && Game.flags['Reserve']) {
            let newName = this.getNameFromRegistry('diplomatEnvoyNames');
            console.log('Spawning new remoteReserver: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'remoteReserver'), newName,
                { memory: { role: 'remoteReserver' } });
        } else if (getCount('remoteGuard') < 1 && Game.flags['Remote']) {
            let newName = this.getNameFromRegistry('militaryNames');
            console.log('Spawning new remoteGuard: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'remoteGuard'), newName,
                { memory: { role: 'remoteGuard' } });
        } else if (getCount('remoteManager') < 3 && Game.flags['Remote']) {
            let newName = this.getNameFromRegistry('builderArchitectNames');
            console.log('Spawning new remoteManager: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'remoteManager'), newName,
                { memory: { role: 'remoteManager' } });
        } else if (!Game.flags['Remote'] && getCount('remoteScout') < 1) {
            let newName = this.getNameFromRegistry('diplomatEnvoyNames');
            console.log('Spawning new remoteScout: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'remoteScout'), newName,
                { memory: { role: 'remoteScout' } });
        } else if (getCount('remoteMiner') < 2 && Game.flags['Remote']) {
            let newName = this.getNameFromRegistry('genericNames');
            console.log('Spawning new remoteMiner: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'remoteMiner'), newName,
                { memory: { role: 'remoteMiner' } });
        } else if (getCount('remoteHauler') < 1 && Game.flags['Remote']) {
            let newName = this.getNameFromRegistry('genericNames');
            console.log('Spawning new remoteHauler: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'remoteHauler'), newName,
                { memory: { role: 'remoteHauler' } });
        } else if (getCount('remoteHarvester') < 1 && Game.flags['Remote']) {
            let newName = this.getNameFromRegistry('genericNames');
            console.log('Spawning new remoteHarvester: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'remoteHarvester'), newName,
                { memory: { role: 'remoteHarvester' } });
        } else if (getCount('remoteStationaryHarvester') < 1 && Game.flags['Remote']) {
            let newName = this.getNameFromRegistry('genericNames');
            console.log('Spawning new remoteStationaryHarvester: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'remoteStationaryHarvester'), newName,
                { memory: { role: 'remoteStationaryHarvester' } });
        } else if (getCount('energyHauler') < 1 && Game.flags['Remote']) {
            let newName = this.getNameFromRegistry('genericNames');
            console.log('Spawning new energyHauler: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'energyHauler'), newName,
                { memory: { role: 'energyHauler' } });
        } else if (getCount('labManager') < 1 && spawn.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LAB } }).length >= 3) {
            let newName = this.getNameFromRegistry('scientistsMathmaticianNames');
            console.log('Spawning new labManager: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'labManager'), newName,
                { memory: { role: 'labManager' } });
        } else if (getCount('factoryManager') < 1 && spawn.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_FACTORY } }).length > 0) {
            let newName = this.getNameFromRegistry('scientistsMathmaticianNames');
            console.log('Spawning new factoryManager: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'factoryManager'), newName,
                { memory: { role: 'factoryManager' } });
        } else if (getCount('nukeManager') < 1 &&
            spawn.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_NUKER } }).some(n => n.store.getFreeCapacity(RESOURCE_ENERGY) > 0 || n.store.getFreeCapacity(RESOURCE_GHODIUM) > 0) &&
            (spawn.room.storage && spawn.room.storage.store[RESOURCE_GHODIUM] >= 500)) {
            let newName = this.getNameFromRegistry('militaryNames');
            console.log('Spawning new nukeManager: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'nukeManager'), newName,
                { memory: { role: 'nukeManager' } });
        } else if (getCount('boostManager') < 1 && spawn.room.memory.boostConfig) {
            let newName = this.getNameFromRegistry('scientistsMathmaticianNames');
            console.log('Spawning new boostManager: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'boostManager'), newName,
                { memory: { role: 'boostManager' } });
        } else if (getCount('portalScout') < 1 && Game.flags['Portal']) {
            let newName = this.getNameFromRegistry('diplomatEnvoyNames');
            console.log('Spawning new portalScout: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'portalScout'), newName,
                { memory: { role: 'portalScout' } });
        } else if (getCount('powerHarvester') < 2 && Game.flags['Power']) {
            let newName = this.getNameFromRegistry('pantheonNames');
            console.log('Spawning new powerHarvester: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'powerHarvester'), newName,
                { memory: { role: 'powerHarvester' } });
        } else if (getCount('powerAttacker') < 2 && Game.flags['Power']) {
            let newName = this.getNameFromRegistry('pantheonNames');
            console.log('Spawning new powerAttacker: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'powerAttacker'), newName,
                { memory: { role: 'powerAttacker' } });
        } else if (getCount('depositMiner') < 1 && Game.flags['Deposit']) {
            let newName = this.getNameFromRegistry('genericNames');
            console.log('Spawning new depositMiner: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'depositMiner'), newName,
                { memory: { role: 'depositMiner' } });
        } else if (getCount('tactical') < 6) {
            let newName = this.getNameFromRegistry('militaryNames');
            console.log('Spawning new tactical unit: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'tactical'), newName,
                { memory: { role: 'tactical' } });
        } else if (getCount('commander') < 1 && spawn.room.controller.level >= 4) {
            let newName = this.getNameFromRegistry('militaryNames');
            console.log('Spawning new Commander: ' + newName);
            spawn.spawnCreep([MOVE, MOVE, CARRY, WORK], newName,
                { memory: { role: 'commander' } });
        } else if (getCount('necromancer') < 1 && Game.flags['Necromancy']) {
            let newName = this.getNameFromRegistry('philosophersNames');
            console.log('Spawning new Necromancer: ' + newName);
            spawn.spawnCreep(this.getCreepBody(spawn.room, 'necromancer'), newName,
                { memory: { role: 'necromancer' } });
        } else if (getCount('archaeologist') < 1) {
            const ruins = spawn.room.find(FIND_RUINS, { filter: r => r.store.getUsedCapacity() > 0 });
            const tombstones = spawn.room.find(FIND_TOMBSTONES, { filter: t => t.store.getUsedCapacity() > 0 });
            if (ruins.length > 0 || tombstones.length > 0) {
                let newName = this.getNameFromRegistry('philosophersNames');
                console.log('Spawning new archaeologist: ' + newName);
                spawn.spawnCreep(this.getCreepBody(spawn.room, 'archaeologist'), newName,
                    { memory: { role: 'archaeologist' } });
            }
        }
    },

    getCreepBody: function (room, role) {
        let capacity = room.energyCapacityAvailable;

        if (role === 'harvester') {
            const harvesters = room.find(FIND_MY_CREEPS, { filter: c => c.memory.role === 'harvester' });
            if (harvesters.length === 0) {
                capacity = room.energyAvailable;
            }
        }

        let body = [];
        // Generic Worker Body (WORK/CARRY/MOVE)
        if (['harvester', 'upgrader', 'builder', 'repairer', 'wallRepairer', 'remoteBuilder', 'remoteHarvester', 'remoteManager'].includes(role)) {
            const maxParts = {
                'harvester': 8, 'upgrader': 8, 'builder': 8, 'repairer': 8, 'wallRepairer': 8,
                'remoteBuilder': 5, 'remoteHarvester': 5,
                'remoteManager': 6,
            };
            let parts = Math.floor(capacity / 250); // 1 WORK, 1 CARRY, 2 MOVE = 250 cost
            parts = Math.min(parts, maxParts[role] || 8);

            if (parts === 0) {
                // Fallback for very low energy recovery, especially for harvesters
                return (capacity >= 200) ? [WORK, CARRY, MOVE] : [WORK, CARRY, MOVE, MOVE];
            }
            for (let i = 0; i < parts; i++) {
                body.push(WORK); body.push(CARRY); body.push(MOVE); body.push(MOVE);
            }
        }
        else if (role === 'soldier' || role === 'remoteGuard') {
            let parts = Math.floor(capacity / 140);
            parts = Math.min(parts, 10);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(TOUGH);
            for (let i = 0; i < parts; i++) body.push(ATTACK);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        } else if (role === 'medic') {
            let parts = Math.floor(capacity / 300);
            parts = Math.min(parts, 5);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) {
                body.push(HEAL); body.push(MOVE);
            }
        } else if (role === 'miner') {
            let workParts = Math.floor((capacity - 50) / 100);
            workParts = Math.min(workParts, 5);
            if (workParts === 0) workParts = 1;
            for (let i = 0; i < workParts; i++) body.push(WORK);
            body.push(MOVE);
        } else if (role === 'hauler') {
            let parts = Math.floor(capacity / 100);
            parts = Math.min(parts, 10);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(CARRY);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        } else if (role === 'scout') {
            return [MOVE];
        } else if (role === 'demolisher') {
            let parts = Math.floor(capacity / 150);
            parts = Math.min(parts, 10);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(WORK);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        } else if (role === 'dismantler') {
            let parts = Math.floor(capacity / 150);
            parts = Math.min(parts, 15);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(WORK);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        } else if (role === 'distributor') {
            let parts = Math.floor(capacity / 100);
            parts = Math.min(parts, 25);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(CARRY);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        } else if (role === 'claimer') {
            return [CLAIM, MOVE];
        } else if (role === 'bigClaimer') {
            let parts = Math.floor(capacity / 650);
            parts = Math.min(parts, 5);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(CLAIM);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        } else if (role === 'remoteReserver') {
            let parts = Math.floor(capacity / 650);
            parts = Math.min(parts, 2);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(CLAIM);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        } else if (role === 'remoteMiner') {
            let parts = Math.floor((capacity - 50) / 150);
            parts = Math.min(parts, 5);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(WORK);
            for (let i = 0; i < parts; i++) body.push(MOVE);
            body.push(CARRY);
        } else if (role === 'remoteBuilder' || role === 'remoteHarvester') {
            let parts = Math.floor(capacity / 250);
            parts = Math.min(parts, 5);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) { body.push(WORK); body.push(CARRY); body.push(MOVE); body.push(MOVE); }
        } else if (role === 'remoteHauler' || role === 'energyHauler') {
            let parts = Math.floor(capacity / 100);
            parts = Math.min(parts, 10);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(CARRY);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        } else if (role === 'remoteStationaryHarvester') {
            let workParts = Math.floor((capacity - 100) / 100);
            workParts = Math.min(workParts, 5);
            if (workParts === 0) workParts = 1;
            for (let i = 0; i < workParts; i++) body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
        } else if (role === 'remoteGuard') {
            let parts = Math.floor(capacity / 140);
            parts = Math.min(parts, 10);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(TOUGH);
            for (let i = 0; i < parts; i++) body.push(ATTACK);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        } else if (role === 'remoteManager') {
            let parts = Math.floor(capacity / 250);
            parts = Math.min(parts, 6);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) { body.push(WORK); body.push(CARRY); body.push(MOVE); body.push(MOVE); }
        } else if (role === 'remoteScout') {
            return [MOVE];
        } else if (role === 'labManager' || role === 'factoryManager' || role === 'nukeManager') {
            let parts = Math.floor(capacity / 100);
            parts = Math.min(parts, 10);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(CARRY);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        } else if (role === 'boostManager') {
            let parts = Math.floor(capacity / 100);
            parts = Math.min(parts, 5);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(CARRY);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        } else if (role === 'portalScout') {
            let parts = Math.floor(capacity / 100);
            parts = Math.min(parts, 20);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(CARRY);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        } else if (role === 'powerHarvester') {
            let parts = Math.floor(capacity / 100);
            parts = Math.min(parts, 25);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(CARRY);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        } else if (role === 'powerAttacker') {
            let parts = Math.floor(capacity / 430);
            parts = Math.min(parts, 12);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(ATTACK);
            for (let i = 0; i < parts; i++) body.push(HEAL);
            for (let i = 0; i < parts * 2; i++) body.push(MOVE);
        } else if (role === 'depositMiner') {
            let parts = Math.floor(capacity / 200);
            parts = Math.min(parts, 15);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) { body.push(WORK); body.push(CARRY); body.push(MOVE); }
        } else if (role === 'tactical') {
            let parts = Math.floor(capacity / 390);
            parts = Math.min(parts, 8);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(TOUGH);
            for (let i = 0; i < parts; i++) body.push(ATTACK);
            for (let i = 0; i < parts; i++) body.push(RANGED_ATTACK);
            for (let i = 0; i < parts * 3; i++) body.push(MOVE);
        } else if (role === 'necromancer') {
            return [WORK, CARRY, MOVE, MOVE];
        } else if (role === 'archaeologist') {
            // Archaeologist: CARRY, MOVE (Fast hauler)
            let parts = Math.floor(capacity / 100);
            parts = Math.min(parts, 15);
            if (parts === 0) parts = 1;
            for (let i = 0; i < parts; i++) body.push(CARRY);
            for (let i = 0; i < parts; i++) body.push(MOVE);
        }
        return body;
    },

    intToRoman: function (num) {
        const map = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
        let result = '';
        for (let key in map) {
            result += key.repeat(Math.floor(num / map[key]));
            num %= map[key];
        }
        return result;
    },

    getNameFromRegistry: function (category) {
        let names = nameRegistry[category] || nameRegistry['genericNames'];
        let baseName = names[Math.floor(Math.random() * names.length)];

        if (!Game.creeps[baseName]) {
            return baseName;
        }

        for (let i = 2; i < 50; i++) {
            let newName = `${baseName}_${this.intToRoman(i)}`;
            if (!Game.creeps[newName]) {
                return newName;
            }
        }

        return baseName + '_' + Game.time;
    }
};

module.exports = spawnManager;