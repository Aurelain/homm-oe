import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import match from '../../utils/match.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
]);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function AstrologistEvent(zipHub) {
    const output = {};

    const weeksInfo = filterHub(zipHub, 'DB/weeks_info.json', null, true);

    const files = filterHub(zipHub, 'DB/weeks/');
    for (const path in files) {
        const fileContent = files[path];
        for (const item of fileContent) {
            const {id} = item;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            // console.log('id:', id);
            output['AstrologistEvent~' + id] = buildDefinitions(item, path, weeksInfo);
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
function buildDefinitions(item, path, weeksInfo) {
    const def = {_type: 'AstrologistEventDef'};
    const category = match(item.id, /([a-z]+)_\d+$/)[1];
    add(def, 'id', item.id);
    add(def, 'category', category);
    add(def, 'name_sid', item.name);
    add(def, 'desc_sid', item.desc);
    add(def, 'icon', item.icon);
    add(def, 'buff_sid', item.buffSid);
    add(def, 'roll_chance', weeksInfo[category + 's'].find((cell) => cell.sid === item.id).rollChance);
    add(def, 'count_to_return', category === 'week' ? weeksInfo.countToReturnWeek : weeksInfo.countToReturnMonth);
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: def.id,
        type: 'astrologist_event',
        name: def.name_sid,
        description: def.desc_sid,
        _data: {},
    });

    return [def, ...translationDefs];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default AstrologistEvent;
