import parseEntries from './helpers/parseEntries.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const ENTRIES = {
    damage: {id: 'unitStat_damage', desc_suffix: '_description_detailed'},
    defence: 'unitStat_defence',
    hp: {id: 'unit_health', desc_suffix: '_description_detailed'},
    initiative: {id: 'unitStat_initiative', desc_suffix: '_description_detailed'},
    luck: 'unitStat_luck',
    moral: 'unitStat_moral',
    offence: 'unitStat_offence',
    speed: {id: 'unitStat_speed', desc_suffix: '_description_detailed'},
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function UnitStat() {
    return parseEntries(ENTRIES, {
        domain: 'UnitStat',
        type: 'unit_stat',
        name_suffix: '',
        path: 'Lang/english/texts/ui.json',
    });
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default UnitStat;
