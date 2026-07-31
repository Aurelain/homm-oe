import filterHub from '../../helpers/filterHub.js';
import translate from './helpers/translate.js';
import assume from '../../utils/assume.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'black_dragon',
    // 'olgoi_upg_alt',
]);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function UnitLabels(zipHub) {
    const output = {};

    // Ability type:
    const abilityTypeIds = collectAbilityTypes(zipHub);
    assume(abilityTypeIds.length, 'No ability type ids found!');
    output['UnitLabels~ability_type'] = generateDefs(abilityTypeIds, 'ability_type');

    // Info description, used to add extra mentions to ability descriptions:
    const infoIds = collectInfoDescription(zipHub);
    assume(infoIds.length, 'No info_description ids found!');
    output['UnitLabels~info_description'] = generateDefs(infoIds, 'info_description');

    return output;
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function collectAbilityTypes(zipHub) {
    const output = [];
    const english = filterHub(zipHub, /english.texts.unitsAbility.json$/, null, true);
    for (const {sid} of english) {
        if (sid.startsWith('Ability_type_')) {
            output.push(sid);
        }
    }
    return output;
}
/**
 *
 */
function collectInfoDescription(zipHub) {
    const set = new Set();
    const views = filterHub(zipHub, /units_views/);
    for (const path in views) {
        const view = views[path][0];
        const abilities = [...(view.alternativeAttacks || []), ...(view.abilities || [])];
        for (const {infoDescription} of abilities) {
            if (infoDescription) {
                set.add(infoDescription);
            }
        }
    }
    return Array.from(set);
}

/**
 *
 */
function generateDefs(ids, type) {
    const requests = ids.map((id) => ({
        target_id: id,
        type,
        name: id,
    }));
    const translations = translate(requests);
    return translations;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default UnitLabels;
