import joinLines from '../../utils/joinLines.js';
import getWords from '../helpers/getWords.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildFooterSpell({lang, school}, translations) {
    const lines = [];
    lines.push(`{{Clear}}`);
    lines.push(`{{SpellsNavbox|lang=${lang}|school=${school}}}`);
    lines.push(`[[Category:${getWords('Spells', translations, lang)}]]`);
    lines.push('__NOTOC__');
    return joinLines(lines);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildFooterSpell;
