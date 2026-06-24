/**
 * Phalanx Tactic
 * 
 * Implements a coordinated squad-based movement and attack strategy.
 * Creeps with the same 'squadId' in memory will attempt to move together.
 */
module.exports = {
    run: function(creep) {
        const squadId = creep.memory.squadId || 'alpha';
        const squad = creep.room.find(FIND_MY_CREEPS, {
            filter: c => c.memory.squadId === squadId
        });

        // 1. Determine Leadership (lowest ID)
        const sortedSquad = _.sortBy(squad, 'id');
        const leader = sortedSquad[0];
        const isLeader = (creep.id === leader.id);

        // 1.5 Determine Formation (Leader Only)
        let formation = 'wedge'; // Default
        if (leader) {
            // Scan terrain around leader to determine if we are in a narrow passage
            let walls = 0;
            const terrain = leader.room.getTerrain();
            for (let x = leader.pos.x - 2; x <= leader.pos.x + 2; x++) {
                for (let y = leader.pos.y - 2; y <= leader.pos.y + 2; y++) {
                    if (terrain.get(x, y) === TERRAIN_MASK_WALL) walls++;
                }
            }
            // If cluttered, switch to column
            if (walls > 8) formation = 'column';
        }

        // 2. Target Acquisition
        let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
                filter: s => s.structureType !== STRUCTURE_CONTROLLER
            });
        }

        // 3. Combat Logic
        let engaging = false;
        if (target) {
            if (creep.getActiveBodyparts(ATTACK) > 0) {
                if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                    creep.moveToTarget(target, '#ff0000');
                }
                engaging = true;
            } else if (creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                if (creep.pos.inRangeTo(target, 3)) {
                    creep.rangedAttack(target);
                } else {
                    creep.moveToTarget(target, '#ff0000');
                }
                engaging = true;
            } else if (creep.getActiveBodyparts(HEAL) > 0) {
                const injured = creep.pos.findClosestByRange(squad, {filter: c => c.hits < c.hitsMax});
                if (injured) {
                    if (creep.heal(injured) === ERR_NOT_IN_RANGE) {
                        creep.rangedHeal(injured);
                        creep.moveToTarget(injured, '#00ff00');
                    }
                    engaging = true;
                }
            }
        } 
        
        // 4. Formation Movement (If not actively engaging/chasing)
        if (!engaging) {
            const flag = Game.flags['Phalanx_' + squadId];
            if (flag && isLeader) {
                creep.moveToTarget(flag, '#ffffff');
            } 
            
            // Follower Formation Logic
            if (leader && !isLeader) {
                // Determine Formation Order: Leader -> Medics -> Others
                // This ensures Medics get index 1 (Center/Protected)
                let formationSquad = [leader];
                const followers = _.filter(squad, c => c.id !== leader.id);
                const medics = _.filter(followers, c => c.getActiveBodyparts(HEAL) > 0);
                const others = _.filter(followers, c => c.getActiveBodyparts(HEAL) === 0);
                formationSquad = formationSquad.concat(medics).concat(others);

                const index = formationSquad.findIndex(c => c.id === creep.id);
                
                // Determine Leader's facing direction (approximate based on target or flag)
                let direction = TOP;
                if (target) direction = leader.pos.getDirectionTo(target);
                else if (flag) direction = leader.pos.getDirectionTo(flag);

                const formationPos = getFormationPos(leader.pos, direction, formation, index);
                
                if (formationPos && !creep.pos.isEqualTo(formationPos)) {
                    creep.moveTo(formationPos.x, formationPos.y, {
                        visualizePathStyle: {stroke: '#00ffff', opacity: 0.5},
                        reusePath: 1
                    });
                }
            }
        }
    }
};

/**
 * Calculates the target position for a squad member based on formation.
 * @param {RoomPosition} leaderPos 
 * @param {number} direction 
 * @param {string} formationType 
 * @param {number} index 
 */
function getFormationPos(leaderPos, direction, formationType, index) {
    if (index === 0) return leaderPos; // Leader is always 0,0

    // Offsets [x, y] relative to leader facing TOP (North)
    // x is Right, y is Down (Behind)
    let offsets = [];
    
    if (formationType === 'column') {
        // Single file line
        offsets = [[0,0], [0,1], [0,2], [0,3], [0,4], [0,5]]; 
    } else {
        // Wedge (Modified for Medic protection)
        // 0: Leader, 1: Center(Medic), 2: Left, 3: Right
        // Leader(0,0), Center(0,1), Left(-1,1), Right(1,1), FarLeft(-2,2)...
        offsets = [[0,0], [0,1], [-1,1], [1,1], [-2,2], [2,2]];
    }

    const offset = offsets[index] || [0,0];
    
    // Rotate offset based on direction
    // Default offsets assume direction = 1 (TOP)
    // We need to rotate (direction - 1) * 45 degrees? 
    // Simplified rotation for Grid:
    // This is a basic approximation. For true rotation we need vector math.
    // Here we just handle the 4 cardinals for simplicity, diagonals map to closest cardinal.
    
    let dx = offset[0];
    let dy = offset[1];

    if (direction === RIGHT || direction === BOTTOM_RIGHT) { let t = dx; dx = -dy; dy = t; } // Rotate 90
    else if (direction === BOTTOM || direction === BOTTOM_LEFT) { dx = -dx; dy = -dy; } // Rotate 180
    else if (direction === LEFT || direction === TOP_LEFT) { let t = dx; dx = dy; dy = -t; } // Rotate 270

    return new RoomPosition(leaderPos.x + dx, leaderPos.y + dy, leaderPos.roomName);
}