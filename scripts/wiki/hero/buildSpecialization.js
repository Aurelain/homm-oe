import joinLines from '../../utils/joinLines.js';
import buildHeading from '../helpers/buildHeading.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildSpecialization({lang, id}, translations) {
    const lines = [];
    lines.push('');
    lines.push(buildHeading('Specialization', translations, lang));
    lines.push(`{{Specialization|lang=${lang}|id=${id}}}`);
    lines.push('');
    return joinLines(lines);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildSpecialization;
