import getWords from './getWords.js';
import pushValid from '../../utils/pushValid.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildSection(key, builder, info, translations, context, parsed) {
    const {lang} = info;
    const lines = [];

    // Get title:
    const title = getWords(key, translations, lang);

    // Remove it from parsed so we don't find it when looking for leftovers:
    delete parsed.sections[title]; // mutation!

    // Call the builder:
    const result = typeof builder === 'function' ? builder(info, translations, context, parsed) : builder;
    pushValid(lines, result);

    // Add existing extra content:
    const extra = parsed.sections[title];
    extra !== result && pushValid(lines, extra);

    // Sanity check:
    if (!lines.length) {
        return [];
    }

    // Add title:
    lines.unshift(`==${title}==`);
    lines.unshift('');

    return lines;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildSection;
