import {unzipSync} from 'fflate';
import {readFileSync} from 'fs';
import assume from '../utils/assume.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const OE_ZIP_PATH =
    '/home/aurelain/.steam/debian-installation/steamapps/common/' +
    'Heroes of Might and Magic Olden Era/HeroesOldenEra_Data/StreamingAssets/Core.zip';
const CHANCES_FILE_PATTERN = /tables\/[^/_]+.[^_/]+_skills_table\.json/;
const SUBCLASSES_FILE_PATTERN = /\/sub_classes_[^_/]+\.json/;
const HERO_FILE_PATTERN = /\/[^_/]+_hero_\d+\.json/;
const HERO_ANTI_PATTERN = /campaign|tutorial/;
const MAX_SLOTS = 8;
const MAX_SKILL_LEVEL = 3;
const OPTIONS_COUNT = 3; // how many options appear in the Level-up dialog
const BATCH = 10000;
const FACTION_TO_PLURAL = {
    demon: 'demons',
    dungeon: 'dungeon',
    human: 'humans',
    nature: 'nature',
    undead: 'necros',
    unfrozen: 'unfrozen',
};
const decoder = new TextDecoder();

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function computeSkillChances() {
    const zipBuffer = readFileSync(OE_ZIP_PATH);
    const zipHub = unzipSync(zipBuffer);

    const chancesPristine = collectByPattern(zipHub, CHANCES_FILE_PATTERN);
    const chancesCache = resolveChances(chancesPristine);

    const subclassesPristine = collectByPattern(zipHub, SUBCLASSES_FILE_PATTERN);

    const heroes = collectByPattern(zipHub, HERO_FILE_PATTERN, HERO_ANTI_PATTERN);

    let targetHeroes = [];
    // targetHeroes.push(...generateBlankHeroes(subclassesPristine));
    targetHeroes.push(...heroes);
    // targetHeroes = [targetHeroes[1]];
    // console.log('targetHeroes:', targetHeroes);
    runBatch(targetHeroes, subclassesPristine, chancesCache);
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function collectByPattern(hub, pattern, exclude) {
    const output = [];
    for (const key in hub) {
        if (key.match(pattern)) {
            if (exclude && key.match(exclude)) {
                continue;
            }
            const fileData = hub[key];
            const content = decoder.decode(fileData);
            const json = JSON.parse(content);
            output.push(...json['array']);
        }
    }
    return output;
}

/**
 *
 */
function resolveChances(chancesPristine) {
    const output = {};
    for (const {id, defaultList, specialList} of chancesPristine) {
        const base = {};

        // Assume that `defaultList` applies to each level:
        const {rollChances} = defaultList[0];
        for (const {sid, chance} of rollChances) {
            base[sid] = chance;
        }

        // Prepare overrides for each level:
        const overrides = {};
        for (const {levels, rollChances} of specialList) {
            for (const level of levels) {
                overrides[level] = overrides[level] || {};
                for (const {sid, chance} of rollChances) {
                    overrides[level][sid] = chance;
                }
            }
        }

        for (let level = 1; level <= MAX_SLOTS * MAX_SKILL_LEVEL; level++) {
            const entry = id + '_' + level;
            output[entry] = {...base, ...overrides[level]};
        }
    }

    return output;
}

/**
 *
 */
function generateBlankHeroes(subclassesPristine) {
    const output = [];
    const used = {};
    for (const {faction, classType} of subclassesPristine) {
        const id = faction + '_generic_' + classType;
        if (!used[id]) {
            used[id] = true;
            output.push({
                fraction: faction,
                classType,
                id,
                skillsRollVariant: `${FACTION_TO_PLURAL[faction]}_${classType}_skills_table`,
                startSkills: [],
            });
        }
    }
    return output;
}

/**
 *
 */
function runBatch(heroes, subclassesPristine, chancesCache) {
    for (const hero of heroes) {
        const subclasses = getSubclassesForHero(hero, subclassesPristine);
        const percents = [];
        for (const subclass of subclasses) {
            let successCount = 0;
            for (let i = 0; i < BATCH; i++) {
                levelUpHeroForSubclass(hero, subclass, chancesCache) && successCount++;
            }
            percents.push(Math.round((100 * successCount) / BATCH) + '%');
        }
        console.log(hero.id + ': ' + percents.join(', '));
    }
}

/**
 *
 */
function getSubclassesForHero(hero, subclassesPristine) {
    const output = [];
    for (const subclass of subclassesPristine) {
        // console.log('subclass:', subclass);
        if (subclass.faction === hero.fraction && subclass.classType === hero.classType) {
            const hub = {};
            for (const {skillSid, skillLevel} of subclass.activationConditions) {
                hub[skillSid] = skillLevel;
            }
            output.push(hub);
        }
    }
    assume(output.length === 2, 'Did not find 2 subclasses!', hero);
    return output;
}

/**
 *
 */
function levelUpHeroForSubclass(hero, subclass, chancesCache) {
    const {startSkills, skillsRollVariant} = hero;
    const skills = {};
    let points = 0;
    for (const {skillLevel, sid} of startSkills) {
        points += skillLevel;
        skills[sid] = skillLevel;
    }

    let level = 1;
    let hasAchievedSubclass = false;
    while (true) {
        if (points >= MAX_SLOTS * MAX_SKILL_LEVEL) {
            // All slots are filled and all skills are expert
            break;
        }
        if (checkSubclassAchieved(skills, subclass)) {
            // All requirements have been achieved
            hasAchievedSubclass = true;
            break;
        }
        level++; // Note: we're starting from 2, not sure if this is ok...
        // console.log('---------------', level);
        // console.log('skills:', skills);

        const chancesForLevel = chancesCache[skillsRollVariant + '_' + level];
        const options = selectThree(skills, chancesForLevel);
        // console.log('options:', options);

        const choice = chooseOne(options, skills, subclass);
        skills[choice] = (skills[choice] || 0) + 1;
        points++;
    }
    return hasAchievedSubclass;
}

/**
 *
 */
function checkSubclassAchieved(skills, subclass) {
    let achieved = 0;
    let total = 0;
    for (const skill in subclass) {
        total++;
        if (!skills[skill] || skills[skill] < subclass[skill]) {
            // return false;
        } else {
            achieved++;
        }
    }
    // console.log(achieved, '/', total);
    return achieved === total;
}

/**
 *
 */
function selectThree(skills, chancesForLevel) {
    const freshPool = {};
    const stubsPool = {};
    for (const key in chancesForLevel) {
        if (key in skills) {
            if (skills[key] < MAX_SKILL_LEVEL) {
                stubsPool[key] = chancesForLevel[key];
            }
        } else {
            freshPool[key] = chancesForLevel[key];
        }
    }

    const stubsCount = Math.min(Object.keys(stubsPool).length, OPTIONS_COUNT);
    const stubs = getUniqueWeightedItems(stubsPool, stubsCount);

    const freshCount = OPTIONS_COUNT - stubsCount;
    const fresh = getUniqueWeightedItems(freshPool, freshCount);

    return {...fresh, ...stubs};
}

/**
 *
 */
function chooseOne(options, skills, subclass) {
    const interesting = {};
    let hasInterestingSkills = false;
    for (const key in subclass) {
        if (key in options && !(key in skills)) {
            hasInterestingSkills = true;
            interesting[key] = options[key];
        }
    }

    if (hasInterestingSkills) {
        const rare = chooseRare(interesting);
        // console.log(`Choosing a subclass skill (${rare})!`);
        return rare;
    }

    for (const key in skills) {
        if (key in options) {
            // console.log(`Choosing to upgrade an existing skill (${key})!`);
            return key;
        }
    }

    const first = Object.keys(options)[0];
    // console.log(`Choosing the first option (${first})!`);
    return first;
}
/**
 *
 */
function chooseRare(hub) {
    let min = Number.MAX_SAFE_INTEGER;
    let rare;
    for (const key in hub) {
        if (hub[key] < min) {
            min = hub[key];
            rare = key;
        }
    }
    return rare;
}

/**
 *
 */
function getUniqueWeightedItems(hub, pickedItemsCount) {
    const values = Object.values(hub);
    if (values.length < 1) {
        return {};
    }

    pickedItemsCount = Math.min(values.length, pickedItemsCount);
    let totalWeight = values.reduce((sum, value) => sum + value, 0);
    const pool = {...hub};
    const picked = {};

    for (let i = 0; i < pickedItemsCount; i++) {
        let random = Math.random() * totalWeight;
        for (const key in pool) {
            if (random < pool[key]) {
                const value = pool[key];
                totalWeight -= value;
                picked[key] = value;
                delete pool[key];
                break;
            }
            random -= pool[key];
        }
    }
    return picked;
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
process.argv.join('').includes('compute-skill-chances') && computeSkillChances();
export default computeSkillChances;
