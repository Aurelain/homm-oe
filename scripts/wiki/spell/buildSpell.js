import buildLoc from '../helpers/buildLoc.js';
import getWords from '../helpers/getWords.js';
import buildStrategy from '../helpers/buildStrategy.js';
import buildSection from '../helpers/buildSection.js';
import buildLeftovers from '../helpers/buildLeftovers.js';
import buildHeading from '../helpers/buildHeading.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildSpell(info, translations, context, parsed) {
    const {id, lang, school, masterfulHero, masterfulFragment} = info;
    const lines = [];

    // Header
    lines.push(buildLoc(info));
    const masterfulOverride = masterfulFragment && !masterfulHero ? `|masterful=${masterfulFragment[lang]}` : '';
    lines.push(`{{SpellInfobox|lang=${lang}|id=${id}${masterfulOverride}}}`);
    lines.push('');
    lines.push(`{{SpellStinger|lang=${lang}|id=${id}}}`);
    if (parsed.header) {
        lines.push('');
        lines.push(parsed.header);
    }

    // Specialist
    if (masterfulFragment) {
        const specialist = `{{SpellSpecialist|lang=${lang}|spell_id=${id}}}`;
        lines.push(...buildSection('Specialist_hero', specialist, info, translations, context, parsed));
    }

    // Strategy
    lines.push(...buildStrategy(info, translations, context, parsed));

    // Leftovers:
    lines.push(...buildLeftovers(parsed));

    // Footer
    lines.push('');
    lines.push(`{{Clear}}`);
    lines.push(buildHeading('Related_pages', translations, lang));
    lines.push(`{{SpellsNavbox|lang=${lang}|school=${school}}}`);
    lines.push(`[[Category:${getWords('Spells', translations, lang)}]]`);
    lines.push('__NOTOC__');

    return lines;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildSpell;
