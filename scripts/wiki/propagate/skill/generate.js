import buildLoc from '../../helpers/buildLoc.js';
import getWords from '../../helpers/getWords.js';
import buildStrategy from '../../helpers/buildStrategy.js';
import buildLeftovers from '../../helpers/buildLeftovers.js';
import buildHeading from '../../helpers/buildHeading.js';
import buildSection from '../../helpers/buildSection.js';

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
    lines.push(`{{SkillInfobox|lang=${lang}|id=${id}}}`);
    lines.push('');
    // lines.push(...buildIntro(info, translations));

    // Skills
    // lines.push(...buildSection('Levels', buildSkills, info, translations, context, parsed));

    // Elite classes
    // lines.push(...buildSection('Elite_classes', buildElites, info, translations, context, parsed));

    // Heroes
    // lines.push(...buildSection('Heroes', buildHeroes, info, translations, context, parsed));

    // Strategy
    // lines.push(...buildStrategy(info, translations, context, parsed));

    // Leftovers:
    // lines.push(...buildLeftovers(parsed));

    // Footer
    lines.push('');
    lines.push(`{{Clear}}`);
    lines.push(buildHeading('Related_pages', translations, lang));
    lines.push(`{{SkillsNavbox|lang=${lang}}}`);
    lines.push(`[[Category:${getWords('Category_hero_skills', translations, lang)}]]`);
    lines.push('__NOTOC__');

    return lines;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default generate;
