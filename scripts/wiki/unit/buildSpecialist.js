import buildHeading from '../helpers/buildHeading.js';
import joinLines from '../../utils/joinLines.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildSpecialist({lang, id}, translations) {
    return [];
    const lines = [];
    lines.push(buildHeading('Specialist', translations, lang));
    lines.push(`{{Specialist | lang=${lang} | id=${id}}}`);
    return joinLines(lines);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildSpecialist;
