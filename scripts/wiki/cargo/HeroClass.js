import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import checkSharedAbility from './helpers/checkSharedAbility.js';
import assume from '../../utils/assume.js';
import checkInterestingAbility from './helpers/checkInterestingAbility.js';
import checkPojo from '../../utils/checkPojo.js';
import size from '../../utils/size.js';
import fishValue from '../../utils/fishValue.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function HeroClass(zipHub) {
    const output = {};
    const heroes = filterHub(zipHub, 'DB/heroes/.*?json', 'campaign|custom');

    const heroClasses = inferClassesFromHeroes(heroes);
    assume(size(heroClasses) === 12, 'Unexpected hero classes count!');

    for (const id in heroClasses) {
        const def = heroClasses[id];
        const translationRequests = [
            {
                target_id: id,
                type: 'hero_class',
                name: id + '_name',
                description: def.class_type + '_desc', // use the same text for all might/magic classes :(
            },
        ];
        output['HeroClass~' + id] = [def, ...translate(translationRequests)];
    }

    return output;
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function inferClassesFromHeroes(heroes) {
    const defs = {};
    for (const path in heroes) {
        const heroList = heroes[path];
        assume(heroList.length === 1, path, 'Unexpected hero list!');
        const def = inferClassFromHero(heroList[0]);
        const {id} = def;
        if (id in defs) {
            const old = JSON.stringify(defs[id]);
            const fresh = JSON.stringify(def);
            assume(old === fresh, old, path, fresh, 'Fresh class is not identical to old class!');
        } else {
            defs[id] = def;
        }
    }
    return defs;
}

/**
 *
 */
function inferClassFromHero(hero) {
    assume(checkPojo(hero), hero, 'Must be pojo!');
    const {fraction, classType} = hero;
    const id = classType + '_' + fraction;
    const def = {_type: 'HeroClassDef'};
    add(def, 'id', id);
    add(def, 'name_sid', id + '_name'); // useless
    add(def, 'desc_sid', classType + '_desc'); // useless
    add(def, 'faction', fraction);
    add(def, 'class_type', classType);
    add(def, 'mesh', hero.mesh);
    add(def, 'mount', hero.mounts);
    add(def, 'native_biome', hero.nativeBiome);
    add(def, 'skills_roll_variant', hero.skillsRollVariant);
    add(def, 'cost_gold', hero.costGold);
    add(def, 'start_level', hero.startLevel);
    add(def, 'attacks_times_before', hero.attacksTimesBefore);
    add(def, 'view_radius', hero.stats?.viewRadius);
    add(def, 'stats_num', hero.stats?.statsNum);
    add(def, 'magic_casts_per_round', hero.stats?.magicCastsPerRound);
    add(def, 'enable_tactics', hero.stats?.enableTactics);
    add(def, 'tactics_placement_size', hero.stats?.tacticsPlacementSize);
    add(def, 'enable_hero_native_biome', hero.stats?.enableHeroNativeBiome);
    add(def, 'offence', hero.stats?.offence);
    add(def, 'defence', hero.stats?.defence);
    add(def, 'spell_power', hero.stats?.spellPower);
    add(def, 'intelligence', hero.stats?.intelligence);
    add(def, 'luck', hero.stats?.luck);
    add(def, 'morale', hero.stats?.moral);
    add(def, 'roll_lvl1_attack', fishValue(hero, 'statsRolls[0].rollChances[0].c'));
    add(def, 'roll_lvl1_defense', fishValue(hero, 'statsRolls[0].rollChances[1].c'));
    add(def, 'roll_lvl1_power', fishValue(hero, 'statsRolls[0].rollChances[2].c'));
    add(def, 'roll_lvl1_knowledge', fishValue(hero, 'statsRolls[0].rollChances[3].c'));
    add(def, 'roll_lvl24_attack', fishValue(hero, 'statsRolls[1].rollChances[0].c'));
    add(def, 'roll_lvl24_defense', fishValue(hero, 'statsRolls[1].rollChances[1].c'));
    add(def, 'roll_lvl24_power', fishValue(hero, 'statsRolls[1].rollChances[2].c'));
    add(def, 'roll_lvl24_knowledge', fishValue(hero, 'statsRolls[1].rollChances[3].c'));
    return def;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default HeroClass;
