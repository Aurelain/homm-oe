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
function Foo(zipHub) {
    const output = {};

    const files = filterHub(zipHub, 'DB/foo/.*?json');
    for (const path in files) {
        const fileContent = files[path];
        for (const item of fileContent) {
            const {id} = item;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            // console.log('id:', id);
            output['Foo~' + id] = buildDefinitions(item, path);
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
    const def = {_type: 'FooDef'};
    add(def, 'id', item.id);
    add(def, 'name_sid', item.name);
    add(def, 'description_sid', item.description);
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: def.id,
        type: 'foo',
        name: def.name_sid,
        description: def.description_sid,
        _data: {},
    });

    return [def, ...translationDefs];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default Foo;
