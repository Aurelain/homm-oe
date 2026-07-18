import joinLines from '../../utils/joinLines.js';
import getWords from '../helpers/getWords.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildFooter({lang, faction}, translations) {
    const lines = [];
    lines.push(`{{Clear}}`);
    lines.push(`{{UnitsNavbox|l=${lang}}}`);
    lines.push(`[[Category:${getWords(`Category_${faction}_Units`, translations, lang)}]]`);
    lines.push(`[[Category:${getWords('Category_Units', translations, lang)}]]`);
    lines.push('__NOTOC__');
    return joinLines(lines);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildFooter;
