import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';

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
function Resource(zipHub) {
    const output = {};

    const files = filterHub(zipHub, 'DB/res/');
    for (const path in files) {
        const fileContent = files[path];
        for (const item of fileContent) {
            const {id} = item;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            // console.log('id:', id);
            output['Resource~' + id] = buildDefinitions(item, path);
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
    const def = {_type: 'EntryDef'};
    add(def, 'type', 'resource');
    add(def, 'subtype', item.id);
    add(def, 'icon', item.icon);
    add(def, 'name_sid', item.name);
    add(def, 'desc_sid', item.desc);
    add(def, 'narrative_description_sid', item.narrativeDesc);
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: def.subtype,
        type: 'resource',
        subtype: def.subtype,
        name: def.name_sid,
        description: def.desc_sid,
        _data: {},
    });

    return [def, ...translationDefs];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default Resource;
