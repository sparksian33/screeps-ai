module.exports.loop = function () {
    //spawnCreep([WORK, MOVE, CARRY, MOVE], "Creep1");
    console.log(`Current game tick is ${Game.time}`);
    for(const i in Game.spawns) {
        Game.spawns[i].spawnCreep([WORK, MOVE, CARRY], "Worker1");
    }

    for (const i in Game.creeps) {
        // Game.creeps.$i.memory == creep.memory
        const creep = Game.creeps[i];
        if (creep.store.getFreeCapacity() === 0 || creep.memory.isUpgrading === true) {
            if (creep.room.controller) {
                creep.memory.isUpgrading = true;
                if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        } else {
            const target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (target) {
                if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        }
    }
}
