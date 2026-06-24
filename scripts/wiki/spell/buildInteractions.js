import joinLines from '../../utils/joinLines.js';
import buildHeading from '../helpers/buildHeading.js';
import getWords from '../helpers/getWords.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildStrategy({lang, id}, translations) {
    const lines = [];
    lines.push('');
    lines.push(buildHeading('Interactions', translations, lang));
    lines.push(`''${getWords('Interactions_text', translations, lang)}''`);
    lines.push('');
    return joinLines(lines);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildStrategy;
