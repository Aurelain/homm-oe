import buildLoc from '../helpers/buildLoc.js';
import getWords from '../helpers/getWords.js';
import buildStrategy from '../helpers/buildStrategy.js';
import buildSection from '../helpers/buildSection.js';
import buildLeftovers from '../helpers/buildLeftovers.js';
import buildHeading from '../helpers/buildHeading.js';
import buildStinger from './buildStinger.js';
import buildLaws from './buildLaws.js';
import buildAbilities from './buildAbilities.js';
import upgradeLinks from '../helpers/upgradeLinks.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function generate(info, translations, context, parsed) {
    const {id, lang, faction, specialist} = info;
    const lines = [];

    // Header
    lines.push(buildLoc(info));
    lines.push(`{{UnitInfobox|lang=${lang}|id=${id}}}`);
    lines.push(...buildStinger(info, translations, context));
    if (parsed.header) {
        lines.push('');
        lines.push(upgradeLinks(parsed.header, lang, context));
    }

    // Description
    const description = `{{Description|lang=${lang}|id=${id}}}`;
    lines.push(...buildSection('Description', description, info, translations, context, parsed));

    // Abilities
    lines.push(...buildSection('Abilities', buildAbilities, info, translations, context, parsed));

    // Specialist
    const specialistTemplate = specialist && `{{UnitSpecialist|lang=${lang}|unit_id=${id}}}`;
    lines.push(...buildSection('Specialist_hero', specialistTemplate, info, translations, context, parsed));

    // Related Laws
    lines.push(...buildSection('Laws', buildLaws, info, translations, context, parsed));

    // Strategy
    lines.push(...buildStrategy(info, translations, context, parsed));

    // Leftovers:
    lines.push(...buildLeftovers(parsed));

    // Footer
    lines.push('');
    lines.push(`{{Clear}}`);
    lines.push(buildHeading('Related_pages', translations, lang));
    lines.push(`{{UnitsNavbox|lang=${lang}|faction=${faction}}}`);
    lines.push(`[[Category:${getWords(`Category_${faction}_Units`, translations, lang)}]]`);
    lines.push(`[[Category:${getWords('Category_Units', translations, lang)}]]`);
    lines.push('__NOTOC__');

    return lines;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default generate;
