import parseEntries from './helpers/parseEntries.js';

const ENTRIES = {
    defence: true,
    intelligence: true,
    luck: true,
    morale: true,
    offence: true,
    spellPower: true,
};

/**
 *
 */
function HeroStat() {
    return parseEntries(ENTRIES, 'HeroStat', 'hero_stat', 'Lang/english/texts/ui.json');
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default HeroStat;
