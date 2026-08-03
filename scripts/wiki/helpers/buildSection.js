import getWords from './getWords.js';
import pushValid from '../../utils/pushValid.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildSection(key, builder, parsed, info, translations, context) {
    const {lang} = info;
    const lines = [];

    // Title:
    const title = getWords(key, translations, lang);
    lines.push('');
    lines.push(`==${title}==`);

    // Call the builder:
    const result = typeof builder === 'function' ? builder(info, translations, context) : builder;
    pushValid(lines, result);

    // Add existing extra content:
    const extra = parsed.sections[title];
    extra !== result && pushValid(lines, extra);

    // Remove it from parsed so we don't find it when looking for leftovers:
    delete parsed.sections[title]; // mutation!

    return lines;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildSection;
