import buildLoc from './buildLoc.js';
import buildCategory from './buildCategory.js';
import buildLevels from './buildLevels.js';
import buildSynergies from './buildSynergies.js';
import buildArtifacts from './buildArtifacts.js';
import joinLines from '../../utils/joinLines.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const MARKER_LEVELS = '###MARKER_LEVELS';
const MARKER_SYNERGIES = '###MARKER_SYNERGIES';
const MARKER_ARTIFACTS = '###MARKER_ARTIFACTS';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function updateExistingSkill(info, translations, existingContent) {
    const cleanedContent = cleanContent(existingContent);

    let adaptedContent = cleanedContent;
    adaptedContent = adaptedContent.replace(MARKER_LEVELS, '\n' + buildLevels(info, translations) + '\n');
    adaptedContent = adaptedContent.replace(MARKER_SYNERGIES, '\n' + buildSynergies(info, translations) + '\n');
    adaptedContent = adaptedContent.replace(MARKER_ARTIFACTS, '\n' + buildArtifacts(info, translations) + '\n');
    adaptedContent = adaptedContent.replaceAll(/###\w+/g, '');

    const lines = [];
    lines.push(buildLoc(info));
    lines.push('__NOTOC__');
    lines.push('');

    lines.push(adaptedContent);

    lines.push('');
    lines.push(buildCategory(info, translations));

    const output = joinLines(lines);

    // if (info.name === 'Arcane Magic') {
    //     console.log('------------------------------');
    //     console.log('existingContent:', existingContent);
    //     console.log('output:', output);
    // }
    return output;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
function cleanContent(content) {
    // General fixes:
    content = content.replaceAll('</table>', '|}');

    // Inject main marker:
    content = content.replace(/\{\{#invoke:SkillsOverview.*?}}/, MARKER_LEVELS);
    content = content.replace(/\{\{#invoke:SubSkillsTable.*?}}/, MARKER_LEVELS);
    content = content.replace(/\{\{Skill table[\s\S]*?}}?/, MARKER_LEVELS);
    content = content.replace(/== ?Levels.*?==+/, MARKER_LEVELS);

    // Inject synergies marker:
    content = content.replace(/\{\{#invoke:SkillSynergies.*?}}/, MARKER_SYNERGIES);
    content = content.replace(/== ?Skill Syn.*?==+[^:]*:/, MARKER_SYNERGIES);
    content = content.replace(/== ?Synerg.*?==+[^:]*:/, MARKER_SYNERGIES);
    content = content.replace(/== ?Синергия.*?==+[^:]*:/, MARKER_SYNERGIES);

    // Inject artifacts marker:
    content = content.replace(/\{\{#invoke:SkillArtifacts.*?}}/, MARKER_ARTIFACTS);
    content = content.replace(/== ?Artifact.*?==+/, MARKER_ARTIFACTS);
    content = content.replace(/== ?Effets d'art.*?==+/, MARKER_ARTIFACTS);
    content = content.replace(/== ?Эффекты арт.*?==+/, MARKER_ARTIFACTS);

    // Clean footer:
    content = content.replaceAll(/\*[\s\S]*?\{/g, '{');
    content = content.replaceAll(/\{\{SkillsNavbox.*?}}/g, '');
    content = content.replaceAll(/\[\[Category.*?]]/g, '');
    content = content.replaceAll('__NOTOC__', '');
    content = content.replaceAll(/\{\{loc.*?}}/gi, '');
    content = content.replaceAll(/\{\|class="wikitable"[\s\S]*?\|}/gi, '');
    content = content.trim();

    return content;
}
// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default updateExistingSkill;
