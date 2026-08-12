import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import parseBonuses from './helpers/parseBonuses.js';

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
function ItemSet(zipHub) {
    const output = {};

    const files = filterHub(zipHub, 'DB/items/item_sets/');
    for (const path in files) {
        const fileContent = files[path];
        for (const item of fileContent) {
            const {id} = item;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            // console.log('id:', id);
            output['ItemSet~' + id] = buildDefinitions(item, path);
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
    const def = {_type: 'ItemSetDef'};
    add(def, 'id', item.id);
    add(def, 'name_sid', item.name);
    add(def, 'items_in_set', item.itemsInSet);
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: def.id,
        type: 'item_set',
        name: def.name_sid,
        _data: {},
    });

    const tierDefs = [];
    const bonuses = item.bonuses || [];
    for (const [i, tierData] of bonuses.entries()) {
        tierDefs.push(...buildTierDef(tierData, i, item));
    }

    return [def, ...translationDefs, ...tierDefs];
}

/**
 *
 */
function buildTierDef(tierData, ordinal, set) {
    const def = {_type: 'ItemSetTierDef'};
    add(def, 'id', set.id + '_tier_' + ordinal);
    add(def, 'set_id', set.id);
    add(def, 'ordinal', ordinal);
    add(def, 'required_amount', tierData.requiredItemsAmount);
    add(def, 'description_sid', tierData.desc);

    const translationDefs = translate({
        target_id: def.id,
        type: 'item_set_tier',
        description: def.description_sid,
        _data: {
            CurrentItemSet: {
                config: set,
            },
        },
    });

    const virtualOwner = {
        id: def.id,
        bonuses: tierData.heroBonuses,
    };
    const bonusDefs = parseBonuses(virtualOwner, 'item_set_tier');

    return [def, ...translationDefs, ...bonusDefs];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default ItemSet;
