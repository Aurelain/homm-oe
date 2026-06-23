import joinLines from '../../utils/joinLines.js';
import getWords from '../helpers/getWords.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildFooterSpell({lang}, translations) {
    const lines = [];
    lines.push('');
    lines.push(`{{Clear}}`);
    lines.push(`----`);
    lines.push(`{{HeroesNavbox|lang=${lang}}}`);
    lines.push(`[[Category:${getWords('Heroes', translations, lang)}]]`);
    return joinLines(lines);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildFooterSpell;
