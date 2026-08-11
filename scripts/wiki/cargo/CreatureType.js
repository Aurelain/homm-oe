import add from './helpers/add.js';
import translate from './helpers/translate.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const TYPES = {
    construct: true,
    demon: true,
    dragon: true,
    embodiment: true,
    living: true,
    magic_creature: true,
    undead: true,
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function CreatureType() {
    const output = {};

    for (const type in TYPES) {
        output['CreatureType~' + type] = buildDefinitions(type);
    }

    return output;
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function buildDefinitions(type) {
    const def = {_type: 'EntryDef'};
    add(def, 'type', 'creature_type');
    add(def, 'subtype', type);
    add(def, 'name_sid', `base_class_${type}`);
    add(def, 'desc_sid', `base_class_${type}_description`);

    const translationDefs = translate({
        target_id: type,
        type: 'creature_type',
        subtype: type,
        name: def.name_sid,
        description: def.desc_sid,
        _data: {},
    });

    return [def, ...translationDefs];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default CreatureType;
