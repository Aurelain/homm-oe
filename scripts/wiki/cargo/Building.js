import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import assume from '../../utils/assume.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'unfrozen_Build_Magic_Guild',
]);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function Building(zipHub) {
    const output = {};

    const files = filterHub(zipHub, 'DB/objects_logic/cities/');
    for (const path in files) {
        const fileContent = files[path];
        assume(fileContent.length === 1, path, 'Unexpected cities count!');
        const city = fileContent[0];
        for (const category in city) {
            const buildings = city[category];
            if (Array.isArray(buildings)) {
                for (const building of buildings) {
                    const {sid} = building;
                    const id = city.fraction + '_' + sid;
                    if (!sid || (IDS.size && !IDS.has(id))) {
                        continue;
                    }
                    console.log('id:', id);
                    if (category === 'hires') {
                        const groupId = city.fraction + '_Build_creature_dwellings';
                        output['Building~' + groupId] = output['Building~' + groupId] || [];
                        output['Building~' + groupId].push(...buildDefinitions(building, path, city, category));
                    } else {
                        output['Building~' + id] = buildDefinitions(building, path, city, category);
                    }
                }
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
function buildDefinitions(building, path, city, category) {
    const output = [];
    for (let i = 0; i < building.icons.length; i++) {
        output.push(...buildBuildingDef(building, path, city, category, i));
    }
    return output;
}

/**
 *
 */
function buildBuildingDef(building, path, city, category, index) {
    const level = index + 1;
    const parametersPerLevel = building.parametersPerLevel[index];
    if (!parametersPerLevel) {
        return [];
    }

    const def = {_type: 'BuildingDef'};
    add(def, 'id', city.fraction + '_' + building.sid + '_L' + level);
    add(def, 'faction', city.fraction);
    add(def, 'category', category);
    add(def, 'sid', building.sid);
    add(def, 'level', level);
    add(def, 'name_sid', building.names[index]);
    add(def, 'desc_sid', building.descriptions[index]);
    add(def, 'narrative_desc_sid', building.narrativeDescriptions[index]);
    add(def, 'icon', building.icons[index]);
    add(def, 'background_image', building.backgroundImages[index]);
    add(def, 'is_constructed_on_start', level === 1 ? building.isConstructedOnStart : undefined);
    add(def, 'level_on_start', level === 1 ? building.levelOnStart : undefined);
    add(def, 'scene_slot', level === 1 ? building.sceneSlot : undefined);
    add(def, 'node_pos_x', parametersPerLevel?.nodePos?.xPos);
    add(def, 'node_pos_y', parametersPerLevel?.nodePos?.yPos);
    add(def, 'prereqs', getPrereqs(parametersPerLevel.prevBuildings));
    add(def, 'gold_cost', parametersPerLevel.costs.find((cost) => cost.name === 'gold')?.cost);
    add(def, 'wood_cost', parametersPerLevel.costs.find((cost) => cost.name === 'wood')?.cost);
    add(def, 'ore_cost', parametersPerLevel.costs.find((cost) => cost.name === 'ore')?.cost);
    add(def, 'crystals_cost', parametersPerLevel.costs.find((cost) => cost.name === 'crystals')?.cost);
    add(def, 'gemstones_cost', parametersPerLevel.costs.find((cost) => cost.name === 'gemstones')?.cost);
    add(def, 'mercury_cost', parametersPerLevel.costs.find((cost) => cost.name === 'mercury')?.cost);
    add(def, 'graal_cost', parametersPerLevel.costs.find((cost) => cost.name === 'graal')?.cost);
    add(def, 'dust_cost', parametersPerLevel.costs.find((cost) => cost.name === 'dust')?.cost);
    add(def, 'units_hire_sid', building.unitsHire?.units[0].sids[0]);
    add(def, 'units_weekly', building.unitsHire?.units[0].weeklyIncrement);
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: def.id,
        type: 'building',
        name: def.name_sid,
        description: def.desc_sid,
        _data: {},
    });

    return [def, ...translationDefs];
}

/**
 *
 */
function getPrereqs(prevBuildings) {
    const output = [];
    for (const {sid, level} of prevBuildings) {
        output.push(sid + '_L' + level);
    }
    return output.length ? output : undefined;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default Building;
