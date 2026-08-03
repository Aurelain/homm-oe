import getWords from './getWords.js';
import pushValid from '../../utils/pushValid.js';
import buildSection from './buildSection.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildStrategy(info, translations, parsed) {
    const {lang} = info;
    const title = getWords('Strategy', translations, lang);
    const existingContent = parsed.sections[title];
    if (existingContent) {
        return buildSection('Strategy', existingContent, parsed, info, translations);
    } else {
        const text = getWords('Strategy_text', translations, lang);
        return buildSection('Strategy', text, parsed, info, translations);
    }
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildStrategy;
