import filter from '../../utils/filter.js';
import {WIKI_DIR} from '../SETTINGS.js';
import walk from '../../utils/walk.js';
import parseTranslationFile from '../helpers/parseTranslationFile.js';
import assume from '../../utils/assume.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 * Returns the array of all skills:
 * [
 *     {
 *         target_id: 'skill_assault',
 *         type: 'skill',
 *         name: {
 *             en: 'Offense',
 *             ...,
 *         },
 *         description: {
 *             en: 'Friendly creatures’ basic attacks deal +15% Damage.',
 *             ...,
 *         },
 *     }
 * ]
 */
function getSkills() {
    const paths = walk(WIKI_DIR + '/Data');
    const skillPaths = filter(paths, '/Skill~skill');
    const actualSkillPaths = filter(skillPaths, (item) => !item.includes('pseudo'));
    const skills = [];
    for (const path of actualSkillPaths) {
        const definitions = parseTranslationFile(path);
        const skillDefinitions = definitions.filter((item) => item.type === 'skill');
        skills.push(...skillDefinitions);
    }
    assume(skills.length === 30, skills.length, 'Unexpected skills count!');
    return skills;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default getSkills;
