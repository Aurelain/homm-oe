import getWords from './getWords.js';
import pushValid from '../../utils/pushValid.js';
import joinLines from '../../utils/joinLines.js';

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

    // Call the builder:
    const result = typeof builder === 'function' ? builder(info, translations, context, parsed) : builder;
    pushValid(lines, result);

    // Add existing extra content:
    let extra = parsed.sections[title];
    if (extra) {
        extra = extra.trim();
        const currentContent = joinLines(lines).trim();
        extra = extra.replace(currentContent, '');
        if (extra) {
            lines.push('');
            lines.push(extra);
        }
    }

    // Remove it from parsed so we don't find it when looking for leftovers:
    delete parsed.sections[title]; // mutation!

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
