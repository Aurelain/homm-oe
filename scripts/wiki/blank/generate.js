import buildLoc from '../helpers/buildLoc.js';
import getWords from '../helpers/getWords.js';
import buildStrategy from '../helpers/buildStrategy.js';
import buildLeftovers from '../helpers/buildLeftovers.js';
import buildHeading from '../helpers/buildHeading.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function generate(info, translations, context, parsed) {
    const {id, lang} = info;
    const lines = [];

    // Header
    lines.push(buildLoc(info));
    lines.push(`{{FooInfobox|lang=${lang}|id=${id}}}`);
    if (parsed.header) {
        lines.push('');
        lines.push(parsed.header);
    }

    // Strategy
    lines.push(...buildStrategy(info, translations, context, parsed));

    // Leftovers:
    lines.push(...buildLeftovers(parsed));

    // Footer
    lines.push('');
    lines.push(`{{Clear}}`);
    lines.push(buildHeading('Related_pages', translations, lang));
    lines.push(`{{FooNavbox|lang=${lang}}}`);
    lines.push(`[[Category:${getWords('Foo', translations, lang)}]]`);
    lines.push('__NOTOC__');

    return lines;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default generate;
