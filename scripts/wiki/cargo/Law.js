import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import match from '../../utils/match.js';
import Faction from './Faction.js';
import parseBonuses from './helpers/parseBonuses.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'fraction_law_demon_1',
]);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function Law(zipHub) {
    const output = {};

    const extra = collectExtra(zipHub);

    const files = filterHub(zipHub, 'DB/fractions_laws/');
    for (const path in files) {
        const fileContent = files[path];
        for (const item of fileContent) {
            const {id} = item;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            // console.log('id:', id);
            output['Law~' + id] = buildDefinitions(item, path, extra);
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
function collectExtra(zipHub) {
    const output = {};
    const factionsCargo = Faction(zipHub);
    for (const key in factionsCargo) {
        const defs = factionsCargo[key];
        for (const def of defs) {
            if (def.law_id) {
                output[def.law_id] = def;
            }
        }
    }
    return output;
}

/**
 *
 */
function buildDefinitions(item, path, extra) {
    const [, ordinal] = match(item.id, /_(\d+)$/);
    const {parametersPerLevel = []} = item;

    const def = {_type: 'LawDef'};
    add(def, 'id', item.id);
    add(def, 'faction', extra[item.id]?.faction);
    add(def, 'ordinal', ordinal);
    add(def, 'tier', extra[item.id]?.tier);
    add(def, 'name_sid', item.name);
    add(def, 'desc_sid', item.desc);
    add(def, 'icon', item.icon);
    add(def, 'max_level', parametersPerLevel.length);
    add(def, 'test', path.includes('test'));
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: def.id,
        type: 'law',
        name: def.name_sid,
    });

    const levelDefs = [];
    for (const [i, levelData] of parametersPerLevel.entries()) {
        levelDefs.push(...buildLevelDef(levelData, i + 1, item));
    }

    return [def, ...translationDefs, ...levelDefs];
}

/**
 *
 */
function buildLevelDef(levelData, level, law) {
    const def = {_type: 'LawLevelDef'};
    add(def, 'law_id', law.id);
    add(def, 'level', level);
    add(def, 'cost', levelData.cost);

    const translationDefs = translate({
        target_id: law.id,
        type: 'law_level',
        variant: level,
        description: law.desc,
        _data: {
            CurrentFractionLawConfig: levelData,
        },
    });

    const virtualData = {...levelData, id: law.id + '_L' + level};
    const bonusDefs = parseBonuses(virtualData, 'law_level');

    return [def, ...translationDefs, ...bonusDefs];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default Law;
