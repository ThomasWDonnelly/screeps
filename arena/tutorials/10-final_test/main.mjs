import { getObjects, getObjectsByPrototype, getTicks } from 'game/utils';
import { Creep, StructureSpawn, Source, StructureTower } from 'game/prototypes';
import { ATTACK, CARRY, ERR_NOT_IN_RANGE, HEAL, MOVE, OK, RANGED_ATTACK, RESOURCE_ENERGY, WORK } from 'game/constants';

var myCreep, myCreeps, myDestination, mySource, mySpawn, myTarget, myTower;
var creep, creeps, hostileCreeps, injuredCreeps, newCreep;
var creep1, creep2, creep3, creep4, creep5, creep6;
// var builders, carriers, grunts, harvesters, infantry, medics, rangers, workers;
// var newCreeps = [ "creep1", "creep2", "creep3", "creep4", "creep5", "creep6", "creep7", "creep8" ];


export function loop() {
    // console.log('Starting tick loop ' + getTicks() + '...');
    hostileCreeps = getObjectsByPrototype(Creep).find(i => !i.my);
    myCreeps = getObjectsByPrototype(Creep).find(i => i.my);
    mySource = getObjectsByPrototype(Source)[0];
    mySpawn = getObjectsByPrototype(StructureSpawn)[0];

    // console.log(mySpawn);
    // console.log(mySource);
    // console.log(myCreeps);
    if(!creep1) {
        creep1 = mySpawn.spawnCreep([MOVE, CARRY, WORK]).object;
    } else {
        if(creep1.store.getFreeCapacity(RESOURCE_ENERGY)) {
            harvestEnergy(mySource, creep1);
        } else {
            if(creep1.transfer(mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                transferEnergy(mySpawn, creep1);
            }
        }

        if(!creep2) {
            creep2 = mySpawn.spawnCreep([MOVE, CARRY, WORK]).object;
        } else {
            if(creep2.store.getFreeCapacity(RESOURCE_ENERGY)) {
                harvestEnergy(mySource, creep2);
            } else {
                if(creep2.transfer(mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    transferEnergy(mySpawn, creep2);
                }
            }

            if(!creep3) {
                creep3 = mySpawn.spawnCreep([MOVE, MOVE, HEAL, HEAL]).object;
            } else {
                if (creep3.attack(hostileCreeps) == ERR_NOT_IN_RANGE) {
                    creep3.moveTo(hostileCreeps);
                }
                
                if(!creep4) {
                    creep4 = mySpawn.spawnCreep([MOVE, MOVE, ATTACK, ATTACK]).object;
                } else {
                    if (creep4.attack(hostileCreeps) == ERR_NOT_IN_RANGE) {
                        creep4.moveTo(hostileCreeps);
                    }

                    if(!creep5) {
                        creep5 = mySpawn.spawnCreep([MOVE, MOVE, ATTACK, ATTACK]).object;
                    } else {
                        if (creep5.attack(hostileCreeps) == ERR_NOT_IN_RANGE) {
                            creep5.moveTo(hostileCreeps);
                        }

                        if(!creep6) {
                            creep6 = mySpawn.spawnCreep([MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK]).object;
                        } else {
                            if (creep6.attack(hostileCreeps) == ERR_NOT_IN_RANGE) {
                                creep6.moveTo(hostileCreeps);
                            }
                        }
                    }
                }
            }
        }
    }
    // console.log('End of tick loop ' + getTicks() + '...');
}

function buildCreep(myStore, myCreeps) { }
function harvestEnergy(mySource, creep) {
    // console.log('Checking creep for available capacity...');
    if(creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
        // console.log('Checking if source is in range...')
        if(creep.harvest(mySource) == ERR_NOT_IN_RANGE) {
            // console.log('Harvesting energy...');
            creep.moveTo(mySource);
        } else {
            // console.log('Nothing to harvest...');
            return OK;
        }
    } else {
        // console.log('Nothing to harvest...');
        return OK;
    }
}

function transferEnergy(mySpawn, creep) {
    // console.log('Checking if source is within range of creep...');
    if(creep.transfer(mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        // console.log('Transferring energy...');
        creep.moveTo(mySpawn);
        return OK;
    } else { 
        // console.log('Nothing to transfer...');
        return OK;
    }
}