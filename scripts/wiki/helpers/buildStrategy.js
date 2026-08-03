import getWords from './getWords.js';
import buildSection from './buildSection.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildStrategy(info, translations, context, parsed) {
    const {lang} = info;
    const title = getWords('Strategy', translations, lang);
    const existingContent = parsed.sections[title];
    if (existingContent) {
        return buildSection('Strategy', existingContent, info, translations, context, parsed);
    } else {
        const text = "''" + getWords('Strategy_text', translations, lang) + "''";
        return buildSection('Strategy', text, info, translations, context, parsed);
    }
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildStrategy;
