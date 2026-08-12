import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import Hero from './Hero.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const FACTIONS = {
    human: 'humans', // plural!
    undead: 'necros', // different!
    nature: 'nature',
    demon: 'demons', // plural!
    unfrozen: 'unfrozen',
    dungeon: 'dungeon',
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function SkillRollReplacement(zipHub) {
    const output = {};

    const heroHub = getHeroHub(zipHub);

    const list = filterHub(zipHub, 'DB/heroes_skills/skills_by_level_replace', null, true);
    for (const item of list) {
        output['SkillRollReplacement~' + item.id] = buildDefinitions(item, heroHub);
    }

    return output;
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function getHeroHub(zipHub) {
    const output = {};
    const cargoHeroes = Hero(zipHub);
    for (const fileName in cargoHeroes) {
        const def = cargoHeroes[fileName][0];
        output[def.id] = def;
    }
    return output;
}

/**
 *
 */
function buildDefinitions(item, heroHub) {
    const hero = heroHub[item.id];
    const faction = FACTIONS[hero.faction];
    const classType = hero.class_type;

    const output = [];
    const info = item.defaultList[0].rollChances[0];
    for (const level of item.defaultList[0].levels) {
        const def = {_type: 'SkillRollReplacementDef'};
        add(def, 'hero_id', item.id);
        add(def, 'arena_table_id', `arenaGame_${faction}_${classType}_skills_table`);
        add(def, 'level', level);
        add(def, 'skill_id', info.sid);
        add(def, 'weight', info.chance);
        output.push(def);
    }
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default SkillRollReplacement;
