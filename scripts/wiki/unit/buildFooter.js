import joinLines from '../../utils/joinLines.js';
import getWords from '../helpers/getWords.js';

const ID_TO_ENGLISH = {
    human: 'Temple',
    undead: 'Necropolis',
    nature: 'Grove',
    demon: 'Hive',
    unfrozen: 'Schism',
    dungeon: 'Dungeon',
    neutral: 'Neutral',
};
// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildFooter({lang, faction}, translations) {
    const suffix = lang === 'en' ? '' : '/' + lang;
    const lines = [];
    lines.push(`{{Clear}}`);
    lines.push(`{{UnitsNavbox|lang=${lang}}}`);
    lines.push(`[[Category:${ID_TO_ENGLISH[faction]} Units${suffix}]]`);
    lines.push(`[[Category:${getWords('Category_Units', translations, lang)}]]`);
    lines.push('__NOTOC__');
    return joinLines(lines);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildFooter;
