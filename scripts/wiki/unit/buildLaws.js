import joinLines from '../../utils/joinLines.js';
import buildHeading from '../helpers/buildHeading.js';
import getWords from '../helpers/getWords.js';
import getLawsDescriptions from '../helpers/getLawsDescriptions.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildLaws(info, translations) {
    const laws = getLawsDescriptions();
    console.log('laws:', laws);
    const {lang} = info;
    const lines = [];
    lines.push('');
    lines.push(buildHeading('Laws', translations, lang));
    lines.push(getWords('Laws_text', translations, lang));
    lines.push(enumerateLawsFor(info));
    lines.push('');
    return joinLines(lines);
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function enumerateLawsFor(info) {
    const {tier} = info;
    // console.log('info:', info);
    return '';
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildLaws;
