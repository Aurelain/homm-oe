import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import checkSharedAbility from './helpers/checkSharedAbility.js';
import checkInterestingAbility from './helpers/checkInterestingAbility.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'black_dragon',
    // 'olgoi_upg_alt',
]);

const FACTIONS = new Set(['human', 'undead', 'nature', 'demon', 'unfrozen', 'dungeon', 'neutral']);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function UnitShared(zipHub) {
    const output = {};

    const abilities = collectAllShared(zipHub);
    for (const id in abilities) {
        output['UnitShared~' + id] = generateDefs(id, abilities[id]);
    }

    return output;
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function collectAllShared(zipHub) {
    const output = {};
    const logics = filterHub(zipHub, /units_logics/);
    const views = filterHub(zipHub, /units_views/);
    for (const path in logics) {
        const id = logics[path][0].id;
        if (IDS.size && !IDS.has(id)) {
            continue;
        }
        // console.log('id:', id);

        const viewsPath = path.replace('_logics/', '_views/').replace('_l.', '_v.');

        const logic = logics[path];
        const view = views[viewsPath];

        const result = collectSharedFromUnit(logic[0], view[0]);
        Object.assign(output, result);
    }
    return output;
}

/**
 *
 */
function collectSharedFromUnit(logic, view) {
    const output = {};
    const {id, passives = []} = view;
    for (const ability of passives) {
        const {name, description} = ability;
        if (checkSharedAbility(name, id) && checkInterestingAbility(name)) {
            const abilityId = name.replace(/_name$/, '');
            output[abilityId] = {name, description, logic};
        }
    }
    return output;
}

/**
 *
 */
function generateDefs(id, {name, description, logic}) {
    const defs = [];

    const def = {_type: 'UnitAbilityPassiveDef'};
    add(def, 'ability_id', id);
    add(def, 'name_sid', name);
    add(def, 'desc_sid', description);
    defs.push(def);

    const translationDefs = translate([
        {
            target_id: id,
            type: 'unit_ability',
            name,
            description,
            _data: {
                currentUnitConfig: logic,
            },
        },
    ]);
    defs.push(...translationDefs);

    return defs;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default UnitShared;
