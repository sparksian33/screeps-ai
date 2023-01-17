module.exports.loop = function () {
    
    console.log(`Current game tick is ${Game.time}`);
    makeWorkerCreeps(Game);
    const workerNumber = Object.keys(Game.creeps).length;
    console.log(workerNumber);

    for (const i in Game.creeps) {

        const creep = Game.creeps[i];

        if (creep.memory.role === role.spawnBaby) {
            goToSpawn(creep)
        }
        if (creep.memory.role === role.upgraderCreep) {
            upgradeRoomController(creep)
        }
    }
}


const role = {
    upgraderCreep: "upgrader",
    builderCreep: "builder",
    spawnBaby: "spawn baby"
}


function goToSpawn(creep) {
    if (creep.store.getFreeCapacity() === 0 || creep.memory.isTransfering) {
        creep.memory.isTransfering = (creep.store.getUsedCapacity() > 0);
        let spawn = Game.spawns["Spawn1"]
        if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn);
        }
    }
    else {
        upgradeRoomController(creep);
    }
}

function upgradeRoomController(creep) {
    if (creep.store.getFreeCapacity() === 0 || creep.memory.isUpgrading) {
        creep.memory.isUpgrading = (creep.store.getUsedCapacity() > 0);
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    }
    else {
        goToHarvest(creep);
    }
}


// This function will be the else to (upgradeController, builders, spawnBaby)
function goToHarvest(creep) {
    const target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (target) {
        if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
}


function makeWorkerCreeps() {
    //make logic in here to figure out which roles
    for (const name in Game.spawns) {
        let role = determineRole()
        Game.spawns[name].spawnCreep([WORK, MOVE, CARRY, MOVE], role + "_" + Game.time, {
            memory: {role: role}
        });
    }
}


function determineRole() {
    let upgraders = getCreepsByRole(role.upgraderCreep).length
    let spawnBabies = getCreepsByRole(role.spawnBaby).length
    if (spawnBabies < 2) {
        return role.spawnBaby
    }
    if (upgraders < 10) {
        return role.upgraderCreep
    }
    console.log("Upgraders: " + upgraders)
    return role.upgraderCreep
}


function getCreepsByRole(role) {
    return Object.keys(Game.creeps).filter(name => {
       return name.startsWith(role)
    })
}