// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
import buildLoc from './buildLoc.js';

const MARKER_SKILL_TABLE = '#MARKER_SKILL_TABLE';
const MARKER_SYNERGIES = '#MARKER_SYNERGIES';
const MARKER_ARTIFACTS = '#MARKER_ARTIFACTS';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function updateExistingSkill(info, translations, existingContent) {
    console.log('existingContent:', existingContent);
    console.log('--------------------');
    const clean = cleanContent(existingContent);
    console.log('clean:', clean);

    // lines.push(buildLoc(info));
    // lines.push('__NOTOC__');
    process.exit(0);
    /*console.log('info:', info);
    const lines = [];
    lines.push(buildLoc(info));
    lines.push('__NOTOC__');
    lines.push('');
    lines.push(buildInvocation('SkillsOverview', info));
    lines.push('');
    lines.push(buildInvocation('SkillSynergies', info));
    lines.push('');
    lines.push(buildInvocation('SkillArtifacts', info));
    lines.push('');
    lines.push('{{SkillsNavbox}}');
    lines.push(`[[Category:${translations.heroSkills[info.lang]}]]`);

    const output = lines.join('\n');
    console.log(output);*/
    return 1;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
function cleanContent(content) {
    // Inject main marker:
    content = content.replace(/\{\{#invoke:SkillsOverview.*?}}/, MARKER_SKILL_TABLE);
    content = content.replace(/\{\{#invoke:SubSkillsTable.*?}}/, MARKER_SKILL_TABLE);
    content = content.replace(/\{\{Skill table[\s\S]*?<\/table>/, MARKER_SKILL_TABLE);
    content = content.replace(/\{\{Skill table[\s\S]*?}}/, MARKER_SKILL_TABLE);

    // Inject synergies marker:
    content = content.replace(/\{\{#invoke:SkillSynergies.*?}}/, MARKER_SYNERGIES);
    content = content.replace(/===.*?Skill Syn.*?===[^:]*:/, MARKER_SYNERGIES);
    content = content.replace(/===.*?Synerg.*?===[^:]*:/, MARKER_SYNERGIES);
    content = content.replace(/===.*?Синергия.*?===[^:]*:/, MARKER_SYNERGIES);

    // Inject artifacts marker:
    content = content.replace(/\{\{#invoke:SkillArtifacts.*?}}/, MARKER_ARTIFACTS);
    content = content.replace(/===.*?Artifact.*?===/, MARKER_ARTIFACTS);
    content = content.replace(/===.*?Effets d'art.*?===/, MARKER_ARTIFACTS);
    content = content.replace(/===.*?Эффекты арт.*?===/, MARKER_ARTIFACTS);

    // Clean footer:
    content = content.replaceAll(/\{\{SkillsNavbox.*?}}/g, '');
    content = content.replaceAll(/\[\[Category.*?]]/g, '');
    content = content.replaceAll('__NOTOC__', '');
    content = content.replaceAll(/\{\{loc.*?}}/gi, '');
    content = content.trim();

    return content;
}
// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default updateExistingSkill;
