import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import match from '../../utils/match.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'foo',
]);
const FACTIONS = {
    humans: 'human', // plural!
    necros: 'undead', // different!
    nature: 'nature',
    demons: 'demon', // plural!
    unfrozen: 'unfrozen',
    dungeon: 'dungeon',
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function SkillRollTable(zipHub) {
    const output = {};

    const files = filterHub(zipHub, 'DB/heroes_skills/skills_by_level_tables/[^/]*$');
    for (const path in files) {
        const fileContent = files[path];
        for (const item of fileContent) {
            const {id} = item;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            // console.log('id:', id);
            output['SkillRollTable~' + id] = buildDefinitions(item, path);
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
function buildDefinitions(item, path) {
    const [, factionPlural, type] = match(item.id, /([a-z]+)_([a-z]+)_skills_table$/);
    const faction = FACTIONS[factionPlural];

    const def = {_type: 'SkillRollTableDef'};
    add(def, 'id', item.id);
    add(def, 'class_id', type + '_' + faction);
    add(def, 'faction', faction);
    add(def, 'class_type', type);
    add(def, 'mode', item.id.split('_').length === 5 ? 'arena' : 'standard');
    add(def, 'source_path', path);

    // Rolls:
    const rollDefs = [];
    const bands = {
        default: item.defaultList.find((r) => r.levels[0] === 1)?.rollChances,
        magic_levels: item.specialList.find((r) => r.levels[0] === 4)?.rollChances,
        signature_levels: item.specialList.find((r) => r.levels[0] === 5)?.rollChances,
        level_20_mega: item.specialList.find((r) => r.levels[0] === 20)?.rollChances,
    };
    for (const key in bands) {
        const rolls = bands[key] || [];
        rolls.sort(compareChances);
        for (const roll of rolls) {
            rollDefs.push(buildRollDef(roll, key, item.id));
        }
    }

    return [def, ...rollDefs];
}

/**
 *
 */
function compareChances(a, b) {
    const aChance = a.chance;
    const bChance = b.chance;

    if (aChance !== bChance) {
        return aChance > bChance ? -1 : 1;
    }

    return a.sid.localeCompare(b.sid);
}

/**
 *
 */
function buildRollDef(roll, band, tableId) {
    const def = {_type: 'SkillRollWeightDef'};
    add(def, 'table_id', tableId);
    add(def, 'band_kind', band);
    add(def, 'skill_id', roll.sid);
    add(def, 'weight', roll.chance);
    return def;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default SkillRollTable;
