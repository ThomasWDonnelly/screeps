// Create a new function for StructureTower
StructureTower.prototype.defend =
    function () {
        // Find closest hostile creep
        var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        // If one is found...
        if (target != undefined) {
            // ...FIRE!
            this.attack(target);
        }
    };
