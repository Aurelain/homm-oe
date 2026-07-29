import filterHub from '../../helpers/filterHub.js';
import assume from '../../utils/assume.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = [
    // -- Test ids:
    'black_dragon',
];

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================

/**
 *
 */
function unit(zipHub) {
    const output = {};
    const logics = filterHub(zipHub, /units_logics/);
    const views = filterHub(zipHub, /units_views/);
    for (const path in logics) {
        if (IDS.length && !path.endsWith(IDS[0] + '_l.json')) {
            continue;
        }
        const viewsPath = path.replace('_logics/', '_views/').replace('_l.', '_v.');
        assume(views[viewsPath], viewsPath, 'Missing path!');

        const logic = logics[path];
        const view = views[viewsPath];
        assume(logic.length === 1 && view.length === 1, path, 'Too many items!');
        const result = parseUnit(logic[0], view[0]);
        if (result) {
            output['Data~' + result.id] = result.content;
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
function parseUnit(logic, view) {
    const unitDef = {};
    // define(unitDef, logic.id, 'id');
    return {
        id: logic.id,
        content: 'foo',
    };
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default unit;
