module.exports.loop = function () {
    
    console.log(`Current game tick is ${Game.time}`);
    makeWorkerCreeps(Game);
    const workerNumber = Object.keys(Game.creeps).length;
    console.log(workerNumber);

    for (const i in Game.creeps) {
        // Game.creeps.$i.memory == creep.memory
        const creep = Game.creeps[i];
        if (creep.store.getFreeCapacity() === 0 || creep.memory.isUpgrading) {
            goToController(creep);
        } else {
            goToHarvest(creep);
        }
    }
}

function goToController(creep) {
    if (creep.room.controller) {
        creep.memory.isUpgrading = (creep.store.getUsedCapacity() > 0);
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE){
            creep.moveTo(creep.room.controller);
        }
    }
}

function goToHarvest(creep) {
    const target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (target) {
        if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
}

function makeWorkerCreeps(Game) {
    for (const i in Game.spawns) {
        Game.spawns[i].spawnCreep([WORK, MOVE, CARRY], "Worker" + Game.time);
    }
}