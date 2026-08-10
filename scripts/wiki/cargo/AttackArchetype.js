import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import match from '../../utils/match.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const TYPES = {
    melee: 'melee',
    remote: 'reach',
    ranged: 'ranged',
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function AttackArchetype(zipHub) {
    const output = {};

    const entries = filterHub(zipHub, 'Lang/english/texts/unitsAbility.json', null, true);

    for (const type in TYPES) {
        const fileName = TYPES[type];
        output['AttackArchetype~' + fileName] = buildDefinitions(fileName, `base_passive_${type}_attack`);
        for (const {sid} of entries) {
            const re = new RegExp(`^base_passive_${type}_attack(.*?)_name$`);
            const [, subtype] = match(sid, re);
            if (subtype !== undefined) {
                const long = type + '_attack' + subtype;
                output['AttackArchetype~' + long] = buildDefinitions(long, `base_passive_${long}`);
            }
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
function buildDefinitions(subtype, key) {
    const def = {_type: 'EntryDef'};
    add(def, 'type', 'attack_archetype');
    add(def, 'subtype', subtype);
    add(def, 'name_sid', key + '_name');
    add(def, 'desc_sid', key + '_description');

    const translationDefs = translate({
        target_id: subtype,
        type: 'attack_archetype',
        subtype: subtype,
        name: def.name_sid,
        description: def.desc_sid,
    });

    return [def, ...translationDefs];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default AttackArchetype;
