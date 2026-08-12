import parseEntries from './helpers/parseEntries.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const ENTRIES = {
    // file: id
    army_laws: true,
    biography: 'hero_window_ui_narrative',
    creature: {
        id: 'arenaUnitCount',
        path: 'Lang/english/texts/menu.json',
    },
    experience: 'hero_exp_name',
    faction: {
        id: 'fractions',
        path: 'Lang/english/texts/menu.json',
    },
    faction_laws: true,
    // level: true, // suppressed, as it has curly braces
    starting_army: {
        id: 'lobby_units',
        path: 'Lang/english/texts/menu.json',
    },
    starting_skills: {
        id: 'lobby_skills',
        path: 'Lang/english/texts/menu.json',
    },
    starting_spells: {
        id: 'lobby_spells',
        path: 'Lang/english/texts/menu.json',
    },
    stats: 'hero_stats_reward_name',
    tier: 'tooltipRang',
    unit_window_narrative: true,
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function UI() {
    return parseEntries(ENTRIES, {
        domain: 'UI',
        type: 'ui',
        prefix: '',
        name_suffix: '',
        suppressDescription: true,
        trimColon: true,
        path: 'Lang/english/texts/ui.json',
    });
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default UI;
