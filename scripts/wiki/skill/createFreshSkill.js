import buildLoc from './buildLoc.js';
import buildCategory from './buildCategory.js';
import buildLevels from './buildLevels.js';
import buildSynergies from './buildSynergies.js';
import buildArtifacts from './buildArtifacts.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function createFreshSkill(info, translations) {
    const lines = [];
    lines.push(buildLoc(info));
    lines.push('__NOTOC__');
    lines.push('');
    lines.push(buildLevels(info, translations));
    lines.push('');
    lines.push(buildSynergies(info, translations));
    lines.push('');
    lines.push(buildArtifacts(info, translations));
    lines.push('');
    lines.push('{{SkillsNavbox}}');
    lines.push(buildCategory(info, translations));

    const output = lines.join('\n');
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default createFreshSkill;
