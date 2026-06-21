import joinLines from '../../utils/joinLines.js';
import buildHeading from '../helpers/buildHeading.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildBiography({lang, id}, translations) {
    const lines = [];
    lines.push('');
    lines.push(buildHeading('Biography', translations, lang));
    lines.push(`{{Biography|lang=${lang}|id=${id}}}`);
    lines.push('');
    return joinLines(lines);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildBiography;
