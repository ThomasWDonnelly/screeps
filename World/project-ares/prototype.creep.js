Creep.prototype.checkEnergyState = function(workingStateName, workingMsg, harvestingMsg) {
    // Example: creep.checkEnergyState('building', '🚧 build', '🔄 harvest');
    
    if(this.memory[workingStateName] && this.store[RESOURCE_ENERGY] == 0) {
        this.memory[workingStateName] = false;
        this.say(harvestingMsg);
    }
    if(!this.memory[workingStateName] && this.store.getFreeCapacity() == 0) {
        this.memory[workingStateName] = true;
        this.say(workingMsg);
    }
};

Creep.prototype.getEnergy = function(useContainer, useSource) {
    // 1. Withdraw from Containers/Storage
    if (useContainer) {
        var container = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) &&
                           s.store[RESOURCE_ENERGY] > 50
        });
        
        if(container) {
            if(this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return; // Successfully found a target
        }
    }

    // 2. Harvest from Sources
    if (useSource) {
        var sources = this.room.find(FIND_SOURCES);
        
        // Your custom sorting logic from role.builder.js
        sources.sort((a, b) => {
            var countA = a.pos.findInRange(FIND_CREEPS, 1, {filter: c => c.id !== this.id}).length;
            var countB = b.pos.findInRange(FIND_CREEPS, 1, {filter: c => c.id !== this.id}).length;
            if (countA !== countB) return countA - countB;
            return this.pos.getRangeTo(a) - this.pos.getRangeTo(b);
        });
        
        if(sources.length > 0) {
            if(this.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                this.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};

Creep.prototype.moveToTarget = function(target, color) {
    this.moveTo(target, {visualizePathStyle: {stroke: color || '#ffffff'}});
};

if (typeof PowerCreep !== 'undefined') {
    PowerCreep.prototype.moveToTarget = Creep.prototype.moveToTarget;
}