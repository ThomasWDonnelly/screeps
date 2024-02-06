// @ts-ignore
import { getObjects, getObjectsByPrototype, getTicks } from 'game/utils';
import { Creep, StructureSpawn, Source, StructureTower } from 'game/prototypes';
import {
    ATTACK,
    CARRY,
    ERR_NOT_IN_RANGE,
    HEAL,
    MOVE,
    OK,
    RANGED_ATTACK,
    RESOURCE_ENERGY,
    WORK
} from 'game/constants';
// import { Constants } from 'game';

//var myDestination, mySource, mySpawn, myTargets, myTowers;
//var creep, creeps, hostileCreeps, injuredCreeps, myCreeps;
//var builders, carriers, grunts, harvesters, infantry, medics, rangers, workers;
var creep1, creep2;
//// Setting enums for creep roles
// const creepRole = Object.freeze({
//     builders: 0,
//     carriers: 1,
//     grunts: 2,
//     harvesters: 3,
//     infantry: 4,
//     medics: 5,
//     rangers: 6,
//     workers: 7
// });

export function loop() {    
    const currentTick = getTicks();
    console.log(currentTick);

    let creeps = getObjectsByPrototype(Creep);
    let sources = getObjectsByPrototype(Source);
    let spawns = getObjectsByPrototype(StructureSpawn);
    let towers = getObjectsByPrototype(StructureTower);

    let hostileCreeps = creeps.filter(creep => !creep.my);
    let injuredCreeps = creeps.filter(creep => creep.hits < creep.hitsMax);
    

    let myCreeps = getObjectsByPrototype(Creep).find(creep => creep.my);
    let mySource = getObjectsByPrototype(Source)[0];
    let mySpawn = getObjectsByPrototype(StructureSpawn).find(i => i.my);
    let myTarget = creeps.find(creep => !creep.my).findClosestByRange(hostileCreeps);
    // let myTowers = towers[0];
    
    // console.log('creeps: ', creeps);
    // console.log('myCreeps: ', myCreeps);
    // console.log('My Creeps: ', myCreeps.length);
    // console.log('injuredCreeps: ', injuredCreeps);
    // console.log('Injured: ', injuredCreeps.length);
    // console.log('hostileCreeps: ', hostileCreeps);
    // console.log('Hostiles: ', hostileCreeps.length);
    // console.log('myTarget: ', myTarget);
    // console.log('Closest Hostile: ', myTarget);
    
    if(!creep1) {
        creep1 = mySpawn.spawnCreep([MOVE]).object;
        console.log(creep1);
        if(creep1.store.getFreeCapacity(RESOURCE_ENERGY)) {
            if(creep1.harvest(mySource) == ERR_NOT_IN_RANGE) {
                creep1.moveTo(mySource);
            }
        } else {
            if(creep1.transfer(mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep1.moveTo(mySpawn);
            }
        }
    } else {
        creep1.moveTo(mySource);

        if(!creep2) {
            creep2 = mySpawn.spawnCreep([MOVE, CARRY, CARRY, WORK]).object;
            if(creep2.store.getFreeCapacity(RESOURCE_ENERGY)) {
                if(creep2.harvest(mySource) == ERR_NOT_IN_RANGE) {
                    creep2.moveTo(mySource);
                }
            } else {
                if(creep2.transfer(mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep2.moveTo(mySpawn);
                }
            }
        }
    }
    
    // console.log('Checking the total creep count is under the limit...');
    // if(myCreeps != []) {
    //     console.log('Spawning creeps...');
    //     console.log('Checking the total creeps by type...');
    //     console.log('builders: ', builders);
    //     if(builders.count < 100) {
    //         // mySpawn.spawnCreep([WORK, CARRY, MOVE]).object;
    //         // console.log('builders: ', builders.length);
    //         console.log('Currently skipping builders type...');

    //         if(carriers.length < 100) {
    //             // mySpawn.spawnCreep([WORK, CARRY, MOVE]).object;
    //             // console.log('carriers: ', carriers.length);
    //             console.log('Currently skipping carriers type...');

    //             if(grunts.length < 100) {
    //                 mySpawn.spawnCreep([WORK, CARRY, MOVE]).object;
    //                 console.log('grunts: ', grunts.length);
                    
    //                 if(harvesters.length < 100) {
    //                     mySpawn.spawnCreep([WORK, CARRY, MOVE]).object;
    //                     console.log('harvesters: ', harvesters.length);
                        
    //                     if(infantry.length < 100) {
    //                         mySpawn.spawnCreep([ATTACK, MOVE]).object;
    //                         console.log('infantry: ', infantry.length);
                            
    //                         if(medics.length < 100) {
    //                             mySpawn.spawnCreep([HEAL, MOVE]).object;
    //                             console.log('medics: ', medics.length);

    //                             if(rangers.length < 100) {
    //                                 mySpawn.spawnCreep([RANGED_ATTACK, MOVE]).object;
    //                                 console.log('rangers: ', rangers.length);

    //                                 if(workers.length < 100) {
    //                                     // mySpawn.spawnCreep([MOVE]).object;
    //                                     // console.log('workers: ', workers.length);
    //                                     console.log('Currently skipping workers type...');
    //                                 } else {}
    //                             } else {}
    //                         } else {}
    //                     } else {}
    //                 }  else {}
    //             }  else {}
    //         }  else {}
    //     } else {
    //         console.log('Total creeps: ', myCreeps.length);
    //         return OK;
    //     }
        
    //     for(creep of myCreeps) {
    //         console.log("Stats: ", creep);
    //         creep.moveTo(mySource);
    //         harvestEnergySources(mySpawn, mySource, myCreeps);
    //     }
    // } else {
    //     for(creep of myCreeps) {
    //         console.log("Stats: ", creep);
    //         creep.moveTo(mySource);
    //         harvestEnergySources(mySpawn, mySource, myCreeps); 
    //     }
    // }
}

function buildCreeps(mySpawn, myCreeps) {
    let builders = myCreeps.filter(creep => creep.bodypart.type == MOVE);
    let carriers = myCreeps.filter(creep => creep.bodypart.type == MOVE);
    let grunts = myCreeps.filter(creep => creep.my && (creep.bodypart.type == WORK || CARRY));
    let harvesters = myCreeps.filter(creep => creep.my && (creep.bodypart.type == WORK || CARRY));
    let infantry = myCreeps.filter(creep => creep.bodypart.type == ATTACK);
    let medics = myCreeps.filter(creep => creep.bodypart.type == HEAL);
    let rangers = myCreeps.filter(creep => creep.bodypart.type == RANGED_ATTACK);
    let workers = myCreeps.filter(creep => creep.bodypart.type == MOVE);

    // Check if the total of my creeps is under the value of n, if so spawn; otherwise move on
    if(builders.length < 100) { mySpawn.spawnCreep([WORK, CARRY, MOVE]).object; } else { return OK; }
    if(carriers.length < 100) { mySpawn.spawnCreep([CARRY, MOVE]).object; } else { return OK; }
    if(grunts.length < 100) { mySpawn.spawnCreep([WORK, CARRY, MOVE]).object; } else { return OK; }
    if(harvesters.length < 100) { mySpawn.spawnCreep([WORK, CARRY, MOVE]).object; } else { return OK; }
    if(infantry.length < 100) { mySpawn.spawnCreep([MOVE, ATTACK]).object; } else { return OK; }
    if(medics.length < 100) { mySpawn.spawnCreep([MOVE, HEAL]).object; } else { return OK; }
    if(rangers.length < 100) { mySpawn.spawnCreep([MOVE, RANGED_ATTACK]).object; } else { return OK; }
    if(workers.length < 100) { mySpawn.spawnCreep([WORK, CARRY]).object; } else { return OK; }
    
    //// Check the total creep count is under the value of n, if so spawn; otherwise move on
    // console.log('Checking the total creep count is under the limit...');
    // console.log('Total creeps: ', myCreeps.length);
    // if(myCreeps.length < 1000) {
    //     // Check total creeps by type
    //     console.log('Checking the total creeps by type...');
    //     if(builders.length < 100) {
    //         // mySpawn.spawnCreep([WORK, CARRY, MOVE]).object;
    //         // console.log('builders: ', builders.length);
    //         console.log('Currently skipping builders type...');

    //         if(carriers.length < 100) {
    //             // mySpawn.spawnCreep([WORK, CARRY, MOVE]).object;
    //             // console.log('carriers: ', carriers.length);
    //             console.log('Currently skipping carriers type...');

    //             if(grunts.length < 100) {
    //                 mySpawn.spawnCreep([WORK, CARRY, MOVE]).object;
    //                 console.log('grunts: ', grunts.length);
                    
    //                 if(harvesters.length < 100) {
    //                     mySpawn.spawnCreep([WORK, CARRY, MOVE]).object;
    //                     console.log('harvesters: ', harvesters.length);
                        
    //                     if(infantry.length < 100) {
    //                         mySpawn.spawnCreep([MOVE, ATTACK]).object;
    //                         console.log('infantry: ', infantry.length);
                            
    //                         if(medics.length < 100) {
    //                             mySpawn.spawnCreep([MOVE, HEAL]).object;
    //                             console.log('medics: ', medics.length);

    //                             if(rangers.length < 100) {
    //                                 mySpawn.spawnCreep([MOVE, RANGED_ATTACK]).object;
    //                                 console.log('rangers: ', rangers.length);

    //                                 if(workers.length < 100) {
    //                                     // mySpawn.spawnCreep([MOVE, CARRY]).object;
    //                                     // console.log('workers: ', workers.length);
    //                                     console.log('Currently skipping workers type...');
    //                                 } else {}
    //                             } else {}
    //                         } else {}
    //                     } else {}
    //                 }  else {}
    //             }  else {}
    //         }  else {}
    //     } else {}
    // } else {
    //     return;
    // }    
}

function countCreepsByType(mySpawn, builders, carriers, grunts, harvesters, infantry, medics, rangers, workers) {
    // Check if the total of my creeps is under the value of n, if so spawn; otherwise move on
    if(builders.length < 100) { mySpawn.spawnCreep([WORK, CARRY, MOVE]).object; } else { return OK; }
    if(carriers.length < 100) { mySpawn.spawnCreep([CARRY, MOVE]).object; } else { return OK; }
    if(grunts.length < 100) { mySpawn.spawnCreep([WORK, CARRY, MOVE]).object; } else { return OK; }
    if(harvesters.length < 100) { mySpawn.spawnCreep([WORK, CARRY, MOVE]).object; } else { return OK; }
    if(infantry.length < 100) { mySpawn.spawnCreep([MOVE, ATTACK]).object; } else { return OK; }
    if(medics.length < 100) { mySpawn.spawnCreep([MOVE, HEAL]).object; } else { return OK; }
    if(rangers.length < 100) { mySpawn.spawnCreep([MOVE, RANGED_ATTACK]).object; } else { return OK; }
    if(workers.length < 100) { mySpawn.spawnCreep([WORK, CARRY]).object; } else { return OK; }
}

function harvestEnergySources(mySpawn, mySource, myCreeps) {
    for(let creep of myCreeps) {
        if (creep.body.some(bodyPart => bodyPart.type == WORK)) {
            if(creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
                if(creep.harvest(mySource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(mySource);
                }
            } else {
                if (creep.transfer(mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(mySpawn);
                }
            }
        }
    }
}