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
    lines.push(buildHeading('Strategy', translations, lang));
    lines.push(`''${getWords('Strategy_text', translations, lang)}''`);
    return joinLines(lines);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildStrategy;
