import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate, {checkExists} from './helpers/translate.js';
import match from '../../utils/match.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'resonant_sphere_orb_of_twilight_artifact',
]);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function MapObject(zipHub) {
    const output = {};

    const files = filterHub(zipHub, 'DB/objects_logic/', /artifacts|campaign|cities|blocks/);
    for (const path in files) {
        const fileContent = files[path];
        for (const item of fileContent) {
            const {id} = item;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            // console.log('id:', id);
            const defs = buildDefinitions(item, path);
            if (defs) {
                output['MapObject~' + id] = defs;
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
function buildDefinitions(item, path) {
    const category = match(path, /(\w+)\/[^\/]+$/)[1];
    const guards = item.guardUnits?.map((u) => `${u.sid}:${u.amount}`);
    const hasName = checkName(item.id + '_name');

    if (category === 'todo') return;
    if (path.includes('event_banks') && !hasName) return;

    const def = {_type: 'MapObjectDef'};
    add(def, 'id', item.id);
    add(def, 'category', category);
    add(def, 'name_sid', hasName && item.id + '_name');
    add(def, 'desc_sid', hasName && item.id + '_description');
    add(def, 'narrative_desc_sid', hasName && item.id + '_narrativeDescription');
    add(def, 'goods_value', item.goodsValue);
    add(def, 'ai_value', item.aiValue);
    add(def, 'custom_guard_value', item.customGuardValue);
    add(def, 'view_radius', item.viewRadius);
    add(def, 'ai_ignore', item.aiIgnore);
    add(def, 'resource_name', item.resName);
    add(def, 'resource_value', item.resValue);
    add(def, 'guard_units', guards);
    add(def, 'fraction', item.fraction);
    add(def, 'tier', item.tier);
    add(def, 'units_hire_sid', item.unitsData?.units[0].sids[0]);
    add(def, 'units_weekly', item.unitsData?.units[0].weeklyIncrement);
    add(def, 'bonus_growth', item.bonuses?.find((b) => b.type === 'cityUnitsIncrementFromBarrack')?.parameters[1]);
    add(def, 'source_path', path);

    const translationDefs = translate([
        {
            target_id: def.id,
            type: 'map_object',
            name: def.name_sid,
            description: def.desc_sid,
            _data: {
                // CurrentItem: item,
            },
        },
        {
            target_id: def.id,
            type: 'map_object_narrative',
            description: def.narrative_desc_sid,
        },
    ]);

    return [def, ...translationDefs];
}

/**
 *
 */
function checkName(nameSid) {
    if (nameSid.includes('scroll_box')) {
        return undefined;
    }
    if (checkExists(nameSid)) {
        return true;
    }
    return undefined;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default MapObject;
