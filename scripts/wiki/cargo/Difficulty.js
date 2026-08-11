import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function Difficulty(zipHub) {
    const output = {};

    const difficulties = filterHub(zipHub, 'DB/difficulties.json', null, true);
    for (const difficulty of difficulties) {
        output['Difficulty~' + difficulty.sid] = buildDefinitions(difficulty, 'DB/difficulties.json');
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
    const def = {_type: 'DifficultyDef'};
    add(def, 'id', item.sid);
    add(def, 'name_sid', item.nameSid);
    add(def, 'neutral_power_multiplier', item.neutralPowerMultiplier);
    add(def, 'player_gold', item.playerStartResources.gold);
    add(def, 'player_wood', item.playerStartResources.wood);
    add(def, 'player_ore', item.playerStartResources.ore);
    add(def, 'player_gemstones', item.playerStartResources.gemstones);
    add(def, 'player_crystals', item.playerStartResources.crystals);
    add(def, 'player_mercury', item.playerStartResources.mercury);
    add(def, 'player_dust', item.playerStartResources.alchemicalDust);
    add(def, 'ai_gold', item.aiStartResources.gold);
    add(def, 'ai_wood', item.aiStartResources.wood);
    add(def, 'ai_ore', item.aiStartResources.ore);
    add(def, 'ai_gemstones', item.aiStartResources.gemstones);
    add(def, 'ai_crystals', item.aiStartResources.crystals);
    add(def, 'ai_mercury', item.aiStartResources.mercury);
    add(def, 'ai_dust', item.aiStartResources.alchemicalDust);
    add(def, 'source_path', path);

    const translationDef = {_type: 'TranslationDef'};
    add(translationDef, 'target_id', item.sid);
    add(translationDef, 'type', 'difficulty');
    add(translationDef, 'language', 'en');
    add(translationDef, 'description', item.descriptionSid);

    return [def, translationDef];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default Difficulty;
