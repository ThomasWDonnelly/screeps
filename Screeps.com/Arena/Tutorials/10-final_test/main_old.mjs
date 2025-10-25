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

// Setting room variables
var destination, myEnergySource, mySpawnPoint, target, myTower;
// Setting creep type variables
var creep, allCreeps, myCreeps, injuredCreeps, hostileCreeps;
// Setting creep role variables
var builders, carriers, grunts, harvesters, infantry, medics, rangers, workers;
// Setting initial creeps
var creep1, creep2, creep3, creep4;

export function loop() {
    const currentTick = getTicks();
    console.log(currentTick);
    let allCreeps = getObjectsByPrototype(Creep);
    console.log('Creep Count: ', allCreeps.length);
    
    let myEnergySource = getObjectsByPrototype(Source)[0];
    console.log('Closest : ', myEnergySource);
    let mySpawnPoint = getObjectsByPrototype(StructureSpawn)[0];
    console.log('Closest: ', mySpawnPoint);
    let myTower = getObjectsByPrototype(StructureTower)[0];
    console.log('Closest: ', myTower);
    

    myCreeps = allCreeps.filter(creep => creep.my);
    // console.log('My Creeps: ', myCreeps.length);
    injuredCreeps = allCreeps.filter(creep => creep.hits < creep.hitsMax);
    // console.log('Injured: ', injuredCreeps.length);
    hostileCreeps = allCreeps.filter(creep => !creep.my);
    // console.log('Hostiles: ', hostileCreeps.length);
    target = allCreeps.find(creep => !creep.my).findClosestByRange(hostileCreeps);
    // console.log('Closest Hostile: ', target);

    if(!myCreeps) {
        console.log('Spawning creeps...');
        console.log('Creep: ', creep);
        var creep = creep.mySpawnPoint.spawnCreep([WORK, CARRY, MOVE]).object;
        
        for(creep of myCreeps) {
            console.log("Stats: ", creep);
            creep.moveTo(myEnergySource);
            harvestEnergySource(mySpawnPoint, myEnergySource);
        }
    } else {
        for(creep of myCreeps) {
            console.log("Stats: ", creep);
            creep.moveTo(myEnergySource);
            harvestEnergySource(myEnergySource); 
        }
    }
    // if(!creep1) {
    //     console.log('Spawning creeps...');
    //     console.log('Creep: ', creep1);
    //     creep1.mySpawnPoint.spawnCreep([WORK, CARRY, MOVE]).object;
    //     for(creep of myCreeps) {
    //         console.log("Stats: ", creep);
    //         creep.moveTo(myEnergySource);
    //         harvestEnergySource(mySpawnPoint, myEnergySource);
    //     }
    // } else {
    //     for(creep of myCreeps) {
    //         console.log("Stats: ", creep);
    //         creep.moveTo(myEnergySource);
    //         harvestEnergySource(myEnergySource); 
    //     }

    //     if(!creep2) {

    //     } else {


    //         if(!creep3) {

    //         } else {


    //             if(!creep4) {

    //             } else {

    //             }
    //         }
    //     }
    // }    
}

function harvestEnergySource(mySpawnPoint, myEnergySource) {
    for(var creep of myCreeps) {
        if (creep.body.some(bodyPart => bodyPart.type == WORK)) {
            if(creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
                if(creep.harvest(myEnergySource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(myEnergySource);
                }
            } else {
                if (creep.transfer(mySpawnPoint, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(mySpawnPoint);
                }
            }
        }
    }
}

function buildCreeps(mySpawnPoint) {
    // Filter builder creeps
    // Filter carrier creeps
    grunts = myCreeps.filter(creep => creep.my && (creep.bodypart.type == WORK || CARRY));
    harvesters = myCreeps.filter(creep => creep.my && (creep.bodypart.type == WORK || CARRY));
    infantry = myCreeps.filter(creep => creep.bodypart.type == ATTACK);
    medics = myCreeps.filter(creep => creep.bodypart.type == HEAL);
    rangers = myCreeps.filter(creep => creep.bodypart.type == RANGED_ATTACK);
    // Filter worker creeps

    if(!grunts) {
        mySpawnPoint.spawnCreep([WORK, CARRY, MOVE]).object;
        console.log('grunts: ', grunts.length);
        if(harvesters.length < 100) {
            mySpawnPoint.spawnCreep([WORK, CARRY, MOVE]).object;
            console.log('harvesters: ', harvesters.length);
            if(infantry.length < 100) {
                mySpawnPoint.spawnCreep([MOVE, ATTACK]).object;
                console.log('infantry: ', infantry.length);
                if(medics.length < 100) {
                    mySpawnPoint.spawnCreep([MOVE, HEAL]).object;
                    console.log('medics: ', medics.length);
                    if(rangers.length < 100) {
                        mySpawnPoint.spawnCreep([MOVE, RANGED_ATTACK]).object;
                    }
                    console.log('rangers: ', rangers.length);
                }
            }
        }
    } else {
        return;
    }
    // Add builders
    // Add carriers
    // if(grunts.Count < 100) { mySpawnPoint.spawnCreep([WORK, CARRY, CARRY, MOVE]).object; }
    // if(harvesters.Count < 100) { mySpawnPoint.spawnCreep([WORK, CARRY, CARRY, MOVE]).object; }
    // if(infantry.Count < 100) { mySpawnPoint.spawnCreep([MOVE, ATTACK]).object; }
    // if(medics.Count < 100) { mySpawnPoint.spawnCreep([MOVE, HEAL]).object; }
    // if(rangers.Count < 100) { mySpawnPoint.spawnCreep([MOVE, RANGED_ATTACK]).object; }
    // Add workers
}