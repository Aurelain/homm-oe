import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import objectify from '../../utils/objectify.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'foo',
]);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function StatBonusRoll(zipHub) {
    const output = {};

    const statHub = getStatHub(zipHub);

    const files = filterHub(zipHub, 'DB/heroes_skills/skills/pseudo_skills.json');
    for (const path in files) {
        const fileContent = files[path];
        for (const item of fileContent) {
            const {id} = item;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            // console.log('id:', id);
            output['StatBonusRoll~' + id] = buildDefinitions(item, statHub);
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
function getStatHub(zipHub) {
    const table = filterHub(zipHub, '/humans_might_skills_table.json', null, true);
    const roll = table[0].defaultList.find((item) => item.levels[0] === -2).rollChances;
    return objectify(roll, 'sid');
}

/**
 *
 */
function buildDefinitions(item, statHub) {
    const def = {_type: 'StatBonusRollDef'};
    add(def, 'id', item.id);
    add(def, 'stat', item.parametersPerLevel[0].bonuses[0].parameters[0]);
    add(def, 'magnitude', item.parametersPerLevel[0].bonuses[0].parameters[1]);
    add(def, 'weight', statHub[item.id].chance);
    add(def, 'name_sid', item.name);
    add(def, 'desc_sid', item.desc);

    const translationDefs = translate({
        target_id: def.id,
        type: 'stat_bonus_roll',
        name: def.name_sid,
        description: def.desc_sid,
        _data: {},
    });

    return [def, ...translationDefs];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default StatBonusRoll;
