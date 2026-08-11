import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import cloneDeep from '../../utils/cloneDeep.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'human_hero_12',
]);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function Hero(zipHub) {
    const output = {};

    const addedSpells = findAddedSpells(zipHub);
    const replacedSpells = findReplacedSpells(zipHub);
    const spellsInfo = {addedSpells, replacedSpells};

    const files = filterHub(zipHub, 'DB/heroes/');
    const defaults = computeDefaults(files);
    const specialDefaults = inferSpecialDefaults(defaults);

    for (const path in files) {
        const fileContent = files[path];
        for (const item of fileContent) {
            const {id} = item;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            // console.log('id:', id);
            const cid = item.classType + '_' + item.fraction;
            const usedDefaults = checkSpecial(path) ? specialDefaults[cid] : defaults[cid];
            output['Hero~' + id] = buildDefinitions(item, cid, path, usedDefaults, spellsInfo);
        }
    }

    return output;
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function findAddedSpells(zipHub) {
    const output = {};
    const files = filterHub(zipHub, 'DB/heroes_skills/skills/');
    for (const path in files) {
        const fileContent = files[path];
        for (const skill of fileContent) {
            const levels = skill.parametersPerLevel || [];
            for (const [i, level] of levels.entries()) {
                const bonuses = level.bonuses || [];
                for (const bonus of bonuses) {
                    if (bonus.type === 'heroMagicAddition') {
                        const id = skill.id + '_L' + (i + 1);
                        output[id] = output[id] || [];
                        output[id].push(bonus.parameters[0]);
                    }
                }
            }
        }
    }
    return output;
}

/**
 *
 */
function findReplacedSpells(zipHub) {
    const output = {};
    const files = filterHub(zipHub, 'DB/heroes_specializations/');
    for (const path in files) {
        const fileContent = files[path];
        for (const specialization of fileContent) {
            for (const bonus of specialization.bonuses) {
                if (bonus.type === 'heroMagicReplace') {
                    output[specialization.id] = output[specialization.id] || [];
                    output[specialization.id].push(bonus.parameters);
                }
            }
        }
    }
    return output;
}

/**
 *
 */
function computeDefaults(files) {
    const defaults = {};
    for (const path in files) {
        if (checkSpecial(path)) {
            continue;
        }
        const fileContent = files[path];
        for (const item of fileContent) {
            const cid = item.classType + '_' + item.fraction;
            if (!defaults[cid]) {
                defaults[cid] = buildDefinitions(item, cid, path)[0];
            }
        }
    }
    return defaults;
}

/**
 *
 */
function inferSpecialDefaults(defaults) {
    const output = cloneDeep(defaults);
    for (const cid in output) {
        const def = output[cid];
        delete def.view_radius;
        delete def.stats_num;
        delete def.magic_casts_per_round;
        delete def.enable_tactics;
        delete def.tactics_placement_size;
        delete def.enable_hero_native_biome;
        delete def.offence;
        delete def.defence;
        delete def.spell_power;
        delete def.intelligence;
        delete def.luck;
        delete def.morale;
    }
    return output;
}

/**
 *
 */
function buildDefinitions(item, cid, path, defaults = {}, spellsInfo = null) {
    const def = {_type: 'HeroDef'};
    add(def, 'id', item.id);
    add(def, 'name_sid', item.name || item.id);
    add(def, 'motto_sid', item.motto || item.id + '_motto');
    add(def, 'desc_sid', item.description || item.id + '_description');
    add(def, 'class_id', cid);
    add(def, 'faction', item.fraction);
    add(def, 'class_type', item.classType);
    add(def, 'icon', item.icon);
    add(def, 'specialization_id', item.specialization);
    add(def, 'source_path', path);
    add(def, 'start_skills', collect(item.startSkills, 'sid'));
    add(def, 'start_skill_levels', collect(item.startSkills, 'skillLevel'));
    add(def, 'start_magics', collect(item.startMagics, 'sidConfig') || 'temp');
    add(def, 'start_level', item.startLevel, 1);
    add(def, 'attacks_times_before', item.attacksTimesBefore, defaults.attacks_times_before);
    add(def, 'mesh', item.mesh, defaults.mesh);
    add(def, 'mount', item.mounts, defaults.mount);
    add(def, 'skills_roll_variant', item.skillsRollVariant, defaults.skills_roll_variant);
    add(def, 'view_radius', item.stats?.viewRadius, defaults.view_radius);
    add(def, 'stats_num', item.stats?.statsNum, defaults.stats_num);
    add(def, 'magic_casts_per_round', item.stats?.magicCastsPerRound, defaults.magic_casts_per_round);
    add(def, 'enable_tactics', item.stats?.enableTactics, defaults.enable_tactics);
    add(def, 'tactics_placement_size', item.stats?.tacticsPlacementSize, defaults.tactics_placement_size);
    add(def, 'enable_hero_native_biome', item.stats?.enableHeroNativeBiome, defaults.enable_hero_native_biome);
    add(def, 'offence', item.stats?.offence, defaults.offence);
    add(def, 'defence', item.stats?.defence, defaults.defence);
    add(def, 'spell_power', item.stats?.spellPower, defaults.spell_power);
    add(def, 'intelligence', item.stats?.intelligence, defaults.intelligence);
    add(def, 'luck', item.stats?.luck, defaults.luck);
    add(def, 'morale', item.stats?.moral, defaults.morale);
    add(def, 'roll_lvl1_attack', getRoll(item, 1, 0) || 0);
    add(def, 'roll_lvl1_defense', getRoll(item, 1, 1) || 0);
    add(def, 'roll_lvl1_power', getRoll(item, 1, 2) || 0);
    add(def, 'roll_lvl1_knowledge', getRoll(item, 1, 3) || 0);
    add(def, 'roll_lvl24_attack', getRoll(item, 24, 0) || 0);
    add(def, 'roll_lvl24_defense', getRoll(item, 24, 1) || 0);
    add(def, 'roll_lvl24_power', getRoll(item, 24, 2) || 0);
    add(def, 'roll_lvl24_knowledge', getRoll(item, 24, 3) || 0);

    clarifyRolls(def, defaults);
    clarifySpells(def, spellsInfo);

    const translationDefs = translate([
        {
            target_id: def.id,
            type: 'hero',
            name: def.name_sid,
            description: def.desc_sid,
        },
        {
            target_id: def.id,
            type: 'hero_motto',
            description: def.motto_sid,
        },
    ]);

    const squadDefs = [];
    for (const [i, squad] of item.startSquad.entries()) {
        squadDefs.push(buildSquadDef(squad, i + 1, item.id, 'primary'));
    }
    for (const [i, squad] of item.startSquadAlt.entries()) {
        squadDefs.push(buildSquadDef(squad, i + 1, item.id, 'alt'));
    }

    return [def, ...translationDefs, ...squadDefs];
}

/**
 *
 */
function clarifyRolls(def, defaults) {
    const rollKeys = Object.keys(def).filter((key) => key.startsWith('roll'));
    let equalToDefault = 0;
    for (const key of rollKeys) {
        equalToDefault += def[key] === defaults[key] ? 1 : 0;
    }
    if (equalToDefault === rollKeys.length) {
        for (const key of rollKeys) {
            delete def[key]; // mutation!
        }
    }
}

/**
 *
 */
function clarifySpells(def, spellInfo) {
    const {specialization_id, start_skills = [], start_skill_levels = []} = def;
    def.start_magics = def.start_magics === 'temp' ? [] : def.start_magics; // remove the "temp", if present
    const {start_magics} = def;

    if (spellInfo) {
        const {addedSpells, replacedSpells} = spellInfo;
        const replacements = replacedSpells[specialization_id] || [];

        // Add spells
        for (const [i, skill] of start_skills.entries()) {
            const id = skill + '_L' + start_skill_levels[i];

            const added = addedSpells[id];
            if (added) {
                start_magics.unshift(...added);
            }
        }

        // Replace spells
        for (const [i, spellName] of start_magics.entries()) {
            for (const pair of replacements) {
                if (pair[0] === spellName) {
                    start_magics[i] = pair[1]; // mutation!
                    break;
                }
            }
        }
    }
    if (!start_magics.length) {
        delete def.start_magics;
    }
}

/**
 *
 */
function checkSpecial(path) {
    return path.includes('campaign') || path.includes('custom');
}

/**
 *
 */
function collect(list, key) {
    const output = list.map((item) => item[key]);
    return output.length ? output : undefined;
}

/**
 *
 */
function getRoll(item, from, attributeIndex) {
    if (!item.statsRolls) {
        return undefined;
    }
    let value = item.statsRolls.find((e) => e.levelFrom === from)?.rollChances[attributeIndex].c;
    if (value === undefined) {
        value = 0;
    }
    return value;
}

/**
 *
 */
function buildSquadDef(squad, slot, heroId, variant) {
    const def = {_type: 'HeroStartSquadDef'};
    add(def, 'hero_id', heroId);
    add(def, 'variant', variant);
    add(def, 'slot', slot);
    add(def, 'unit_id', squad.sid);
    add(def, 'min', squad.min);
    add(def, 'max', squad.max);
    return def;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default Hero;
