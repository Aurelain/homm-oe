import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import parseBonuses from './helpers/parseBonuses.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'sub_class_demons_magic_1',
]);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function HeroSubClass(zipHub) {
    const output = {};

    const files = filterHub(zipHub, 'DB/heroes_sub_classes/.*?json');
    for (const path in files) {
        const fileContent = files[path];
        for (const item of fileContent) {
            const {id} = item;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            // console.log('id:', id);
            output['HeroSubClass~' + id] = buildDefinitions(item, path);
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
    const def = {_type: 'HeroSubClassDef'};
    add(def, 'id', item.id);
    add(def, 'name_sid', item.name);
    add(def, 'desc_sid', item.desc);
    add(def, 'icon', item.icon);
    add(def, 'faction', item.faction);
    add(def, 'class_type', item.classType);
    add(def, 'activation_skill_1_sid', item.activationConditions[0].skillSid);
    add(def, 'activation_skill_1_level', item.activationConditions[0].skillLevel);
    add(def, 'activation_skill_2_sid', item.activationConditions[1].skillSid);
    add(def, 'activation_skill_2_level', item.activationConditions[1].skillLevel);
    add(def, 'activation_skill_3_sid', item.activationConditions[2].skillSid);
    add(def, 'activation_skill_3_level', item.activationConditions[2].skillLevel);
    add(def, 'activation_skill_4_sid', item.activationConditions[3].skillSid);
    add(def, 'activation_skill_4_level', item.activationConditions[3].skillLevel);
    add(def, 'activation_skill_5_sid', item.activationConditions[4].skillSid);
    add(def, 'activation_skill_5_level', item.activationConditions[4].skillLevel);
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: def.id,
        type: 'hero_sub_class',
        name: def.name_sid,
        description: def.desc_sid,
        _data: {},
    });

    const bonusDefs = parseBonuses(item, 'hero_sub_class');

    return [def, ...translationDefs, ...bonusDefs];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default HeroSubClass;
