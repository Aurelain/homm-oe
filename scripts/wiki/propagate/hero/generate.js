import buildLoc from '../../helpers/buildLoc.js';
import getWords from '../../helpers/getWords.js';
import buildHeading from '../../helpers/buildHeading.js';
import buildSection from '../../helpers/buildSection.js';
import buildLeftovers from '../../helpers/buildLeftovers.js';
import buildSpecialization from './buildSpecialization.js';
import buildStrategy from '../../helpers/buildStrategy.js';
import buildBiography from './buildBiography.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function generate(info, translations, context, parsed) {
    const {id, lang, faction} = info;
    const lines = [];

    // Header
    lines.push(buildLoc(info));
    lines.push(`{{HeroInfoBox|lang=${lang}|id=${id}}}`);
    lines.push(`{{HeroStinger|lang=${lang}|id=${id}}}`);
    if (parsed.header) {
        lines.push('');
        lines.push(parsed.header);
    }

    // Specialization
    lines.push(...buildSection('Specialization', buildSpecialization, info, translations, context, parsed));

    // Biography
    lines.push(...buildSection('Biography', buildBiography, info, translations, context, parsed));

    // Strategy
    lines.push(...buildStrategy(info, translations, context, parsed));

    // Leftovers:
    lines.push(...buildLeftovers(parsed));

    // Footer
    lines.push('');
    lines.push(`{{Clear}}`);
    lines.push(buildHeading('Related_pages', translations, lang));
    lines.push(`{{HeroesNavbox|lang=${lang}}}|faction=${faction}}}`);
    lines.push(`[[Category:${getWords('Heroes', translations, lang)}]]`);
    lines.push('__NOTOC__');

    return lines;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default generate;
