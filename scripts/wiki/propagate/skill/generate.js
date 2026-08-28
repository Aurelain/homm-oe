import buildLoc from '../../helpers/buildLoc.js';
import getWords from '../../helpers/getWords.js';
import buildHeading from '../../helpers/buildHeading.js';
import buildSection from '../../helpers/buildSection.js';
import buildLevels from './buildLevels.js';
import buildChances from './buildChances.js';
import buildArtifacts from './buildArtifacts.js';
import buildSynergies from './buildSynergies.js';

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
    if (parsed.header) {
        lines.push('');
        lines.push(parsed.header);
    }

    // Levels
    lines.push(...buildSection('Levels', buildLevels, info, translations, context, parsed));

    // Chances
    lines.push(...buildSection('Chances', buildChances, info, translations, context, parsed));

    // Skill synergies
    lines.push(...buildSection('Skill_synergies', buildSynergies, info, translations, context, parsed));

    // Artifact effects
    lines.push(...buildSection('Artifact_effects', buildArtifacts, info, translations, context, parsed));

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
