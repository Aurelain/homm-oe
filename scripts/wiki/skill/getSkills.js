import filter from '../../utils/filter.js';
import {LANG_COUNT, SKILLS_COUNT, WIKI_DIR} from '../SETTINGS.js';
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
        const skillDefinition = skillDefinitions.find((item) => item.type === 'skill');
        assume(skillDefinitions.length === 1, 'Expecting only one skill from a file!');
        const names = Object.values(skillDefinitions[0].name);
        assume(names.length === LANG_COUNT, names, 'Unexpected languages count!');
        skills.push(skillDefinition);
    }
    assume(skills.length === SKILLS_COUNT, skills.length, 'Unexpected skills count!');
    return skills;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default getSkills;
