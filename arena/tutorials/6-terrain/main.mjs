import { getObjectsByPrototype } from 'game/utils';
import { Creep, Flag } from 'game/prototypes';
import { } from 'game/constants';

export function loop() {
    // Your code goes here
    const creeps = getObjectsByPrototype(Creep).filter(i = i.my);
    const flags = getObjectsByPrototype(Flag);

    for(var creep of creeps) {
        var flag = creep.findClosestByPath(flags);
        creep.moveTo(flag);
    }
}