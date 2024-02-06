import { getObjectsByPrototype } from 'game/utils';
import { Creep, Flag, StructureSpawn } from 'game/prototypes';
import { MOVE, CARRY, ATTACK, WORK } from 'game/constants';

var creep1, creep2;

export function loop() {
    // Your code goes here
    var mySpawn = getObjectsByPrototype(StructureSpawn)[0];
    var flags = getObjectsByPrototype(Flag);

    if(!creep1) {
        creep1 = mySpawn.spawnCreep([MOVE]).object;
        // console.log('Creep1: ', creep1);
    } else {
        // console.log('Creep1: ', creep1);
        creep1.moveTo(flags[0]);

        if(!creep2) {
            creep2 = mySpawn.spawnCreep([MOVE]).object;
            // console.log('Creep2: ', creep2);
        } else {
            // console.log('Creep2: ', creep2);
            creep2.moveTo(flags[1]);
        }
    }
}