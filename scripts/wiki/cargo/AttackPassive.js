import add from './helpers/add.js';
import translate from './helpers/translate.js';
import match from '../../utils/match.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const FILE_TO_ID = {
    area_strike: 'base_passive_strike_rumble_1',
    area_strike_falloff: 'base_passive_strike_rumble_2',
    cone_strike: 'base_passive_strike_tri_reach_1',
    dragonbreath_strike: 'base_passive_strike_reach_1',
    dragonbreath_strike_falloff: 'base_passive_strike_reach_2',
    sweeping_strike: 'base_passive_strike_swipe_1',
    sweeping_strike_falloff: 'base_passive_strike_swipe_2',
    whirlwind_strike: 'base_passive_strike_swirl_1',
    whirlwind_strike_falloff: 'base_passive_strike_swirl_2',
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function AttackPassive() {
    const output = {};

    for (const file in FILE_TO_ID) {
        const id = FILE_TO_ID[file];
        output['AttackPassive~' + file] = buildDefinitions(file, id);
    }

    return output;
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function buildDefinitions(file, id) {
    const def = {_type: 'AttackPassiveDef'};
    add(def, 'attack_passive_id', file);
    add(def, 'pattern_token', match(id, /strike_(.*?)_\d$/)[1]);
    add(def, 'rank', match(id, /\d$/)[0]);
    add(def, 'name_sid', id + '_name');
    add(def, 'desc_sid', id + '_description');

    const translationDefs = translate({
        target_id: file,
        type: 'attack_passive',
        name: def.name_sid,
        description: def.desc_sid,
    });

    return [def, ...translationDefs];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default AttackPassive;
