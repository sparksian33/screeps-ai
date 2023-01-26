module.exports.loop = function () {

    //    console.log(`Current game tick is ${Game.time}`);
    cleanUpMemory();
    makeCreeps(Game);
    const workerNumber = Object.keys(Game.creeps).length;
    console.log("Total Creeps: " + workerNumber);

    let spawn = Game.spawns["Spawn1"];

    for (const i in Game.creeps) {

        const creep = Game.creeps[i];
        let hasTask = false;

        if (creep.memory.role === role.spawnBaby && spawn.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
            hasTask = true;
            goToSpawn(creep)
        }
        else if (creep.memory.role === role.builderCreep) {
            // creep.room.visual.circle(creep.pos.x, creep.pos.y, {
            //     radius: 1,
            // })
            hasTask = true;
            goToBuild(creep)
        }
        else if (creep.memory.role === role.attackerCreep) {
            hasTask = true;
            goToHostile(creep)
        }

        if (!hasTask) {
            upgradeRoomController(creep)
        }
    }
}


const role = {
    upgraderCreep: "upgrader",
    builderCreep: "builder",
    spawnBaby: "spawn baby",
    attackerCreep: "attacker"
}


function goToHostile(creep) {
    const target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if (target) {
        console.log(target)
        if (creep.rangedAttack(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
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


function goToBuild(creep) {
    if (creep.store.getFreeCapacity() === 0 || creep.memory.isBuilding) {
        creep.memory.isBuilding = (creep.store.getUsedCapacity() > 0);
        target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        //        console.log(target)
        if (target != null) {
            if (creep.build(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        else if (target == null) {
            //            console.log(target)
            //          not efficient. Goes to random extension instead of the closest by Path/Range
            let isRefilling = false;
            for (const i in Game.structures) {
                let structure = Game.structures[i]
                let allowedStructures = [STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_STORAGE]
                if (allowedStructures.includes(structure.structureType)  && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    isRefilling = true;
                    if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(structure);
                    }
                }
            }
            if (!isRefilling) {
                upgradeRoomController(creep);
            }
        }
    }
    else {
        goToHarvest(creep)
    }
}


// This function will be the default to (builders and spawnBaby)
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


// This function will be the else to (upgradeRoomController)
function goToHarvest(creep) {
    const target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (target) {
        if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
}


function makeCreeps() {
    //make logic in here to figure out which roles
    for (const name in Game.spawns) {
        let role = determineRole(name)
        let spawn = Game.spawns[name]
        const targets = spawn.room.find(FIND_HOSTILE_CREEPS)
        if (targets.length > 0) {
            Game.spawns[name].spawnCreep([MOVE, MOVE, RANGED_ATTACK], role + "_" + Game.time, {
                memory: { role: role }
            });
        }
        if (role != null) {
            Game.spawns[name].spawnCreep([WORK, MOVE, CARRY, MOVE], role + "_" + Game.time, {
                memory: { role: role }
            });
        }
    }
}


function determineRole(name) {
    let upgraders = getCreepsByRole(role.upgraderCreep).length
    let spawnBabies = getCreepsByRole(role.spawnBaby).length
    let builders = getCreepsByRole(role.builderCreep).length
    let attackers = getCreepsByRole(role.attackerCreep).length
    let targets = Game.spawns[name].room.find(FIND_HOSTILE_CREEPS).length
    if (targets > 0) {
        console.log("Attackers: " + attackers)
        return role.attackerCreep
    }
    if (spawnBabies < 10) {
        console.log("Spawn Babies: " + spawnBabies)
        return role.spawnBaby
    }
    if (builders < 10) {
        console.log("Builders: " + builders)
        return role.builderCreep
    }
    if (upgraders < 8) {
        return role.upgraderCreep
    }
    console.log("Upgraders: " + upgraders)
    return null
}


function getCreepsByRole(role) {
    return Object.keys(Game.creeps).filter(name => {
        return name.startsWith(role)
    })
}

function cleanUpMemory() {
    for (const i in Memory.creeps) {
        if (!(i in Game.creeps)) {
            delete Memory.creeps[i]
        }
    }
}