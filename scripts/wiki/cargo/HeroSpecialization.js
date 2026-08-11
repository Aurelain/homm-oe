import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import parseBonuses from './helpers/parseBonuses.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'demon_hero_1_specialization',
]);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function HeroSpecialization(zipHub) {
    const output = {};

    const files = filterHub(zipHub, 'DB/heroes_specializations/');
    for (const path in files) {
        const fileContent = files[path];
        for (const item of fileContent) {
            const {id} = item;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            // console.log('id:', id);
            output['HeroSpecialization~' + id] = buildDefinitions(item, path);
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
    const def = {_type: 'HeroSpecializationDef'};
    add(def, 'id', item.id);
    add(def, 'name_sid', item.name);
    add(def, 'desc_sid', item.desc);
    add(def, 'icon', item.icon);
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: def.id,
        type: 'hero_specialization',
        name: def.name_sid,
        description: def.desc_sid,
        _data: {
            CurrentHeroSpecializationConfig: item,
        },
    });

    const bonusDefs = parseBonuses(item, 'hero_specialization');

    return [def, ...translationDefs, ...bonusDefs];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default HeroSpecialization;
