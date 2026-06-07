import readFiles from '../helpers/readFiles.js';
import filter from '../../utils/filter.js';
import enumerate from '../../utils/enumerate.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function skill() {
    const dataFiles = readFiles('Data');
    let skillData = filter(dataFiles, '/Skill~skill_', 'key');
    skillData = filter(skillData, (item) => !item.includes('pseudo'), 'key');
    enumerate(skillData);

    const mainFiles = readFiles('Main');
    const enSkillFiles = filter(mainFiles, '[[Category:Hero Skills]]');
    enumerate(enSkillFiles);
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
skill();
