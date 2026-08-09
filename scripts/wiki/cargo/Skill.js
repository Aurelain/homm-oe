import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import patch from './helpers/patch.js';
import assume from '../../utils/assume.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    'skill_assault',
]);
const VARIANTS = {
    'pseudo_skills.json': 'pseudo',
    'skills.json': 'production',
    'skills_arena.json': 'arena',
    'skills_campaign.json': 'campaign',
    'sub_skills.json': 'production',
    'sub_skills_arena.json': 'arena',
    'sub_skills_campaign.json': 'campaign',
    'sub_skills_test.json': 'test',
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function Skill(zipHub) {
    const output = {};

    const preparedSubskills = prepareSubskills(zipHub);

    const skillFiles = filterHub(zipHub, 'DB/heroes_skills/skills/.*?json');
    for (const path in skillFiles) {
        const skills = skillFiles[path];
        for (const skill of skills) {
            const {id} = skill;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            output['Skill~' + id] = buildMainDefinitions(skill, path, preparedSubskills);
        }
    }

    // TODO
    // <!-- Catch-all page for sub-skills not referenced by any skill's subSkills[] list (test entries + legacy arena variants). -->

    return output;
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function prepareSubskills(zipHub) {
    const output = {};
    const subskillFiles = filterHub(zipHub, 'DB/heroes_skills/sub_skills/.*?json');
    for (const path in subskillFiles) {
        const subskills = subskillFiles[path];
        for (const subskill of subskills) {
            const {id} = subskill;
            output[id] = buildSubskillDefs(subskill, path);
        }
    }
    return output;
}

/**
 *
 */
function buildSubskillDefs(subskill, path) {
    patch(subskill);
    const def = {_type: 'SubSkillDef'};
    add(def, 'id', subskill.id);
    add(def, 'variant', VARIANTS[path.split('/').pop()]);
    add(def, 'parent_skill_id', subskill.id.replace(/^sub_/, '').replace(/_\d$/, ''));
    add(def, 'name_sid', subskill.name);
    add(def, 'desc_sid', subskill.desc);
    add(def, 'icon', subskill.icon);
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: def.id,
        type: 'sub_skill',
        name: def.name_sid,
        description: def.desc_sid,
        _data: {
            currentSubSkill: subskill,
        },
    });

    const bonusDefs = [];
    for (let i = 0; i < subskill.bonuses.length; i++) {
        const bonus = subskill.bonuses[i];
        const bonusDef = buildBonusDef(bonus, 'sub_skill', subskill.id, i);
        bonusDefs.push(bonusDef);
    }

    return [def, ...translationDefs, ...bonusDefs];
}

/**
 *
 */
function buildBonusDef(bonus, parentType, parentId, bonusIndex) {
    const def = {_type: 'BonusDef'};
    add(def, 'parent_type', parentType);
    add(def, 'parent_id', parentId);
    add(def, 'ordinal', bonusIndex);
    add(def, 'type', bonus.type);
    add(def, 'parameters', bonus.parameters);
    add(def, 'receiver_allegiance', bonus.receiverAllegiance);
    return def;
}

/**
 *
 */
function buildMainDefinitions(skill, path, preparedSubskills) {
    const output = [];
    output.push(...buildSkillDef(skill, path));
    for (let i = 0; i < skill.parametersPerLevel.length; i++) {
        const parameter = skill.parametersPerLevel[i];
        output.push(...buildSkillRankDef(skill, parameter, i + 1));
    }
    const usedSubskills = new Set();
    for (let i = 0; i < skill.parametersPerLevel.length; i++) {
        const {subSkills} = skill.parametersPerLevel[i];
        for (const subSkillName of subSkills) {
            assume(subSkillName in preparedSubskills, subSkillName, 'Not found in prepared subskills!');
            usedSubskills.add(subSkillName);
        }
    }
    const sortedNames = Array.from(usedSubskills).sort();
    sortedNames.forEach((name) => output.push(...preparedSubskills[name]));

    return output;
}

/**
 *
 */
function buildSkillDef(skill, path) {
    const def = {_type: 'SkillDef'};
    add(def, 'id', skill.id);
    add(def, 'variant', VARIANTS[path.split('/').pop()]);
    add(def, 'skill_type', skill.skillType);
    add(def, 'is_pseudo', def.variant === 'pseudo');
    add(def, 'name_sid', skill.name);
    add(def, 'desc_sid', skill.desc);
    add(def, 'max_level', skill.parametersPerLevel.length);
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: skill.id,
        type: 'skill',
        name: def.name_sid,
        description: def.desc_sid,
        _data: {
            currentSkillParameter: skill.parametersPerLevel[0],
        },
    });

    return [def, ...translationDefs];
}

/**
 *
 */
function buildSkillRankDef(skill, parameter, level) {
    const output = [];

    const def = {_type: 'SkillLevelDef'};
    add(def, 'skill_id', skill.id);
    add(def, 'level', level);
    add(def, 'name_sid', parameter.name);
    add(def, 'desc_sid', parameter.desc);
    add(def, 'icon', parameter.icon);
    add(def, 'offered_sub_skills', parameter.subSkills);
    output.push(def);

    const translationDefs = translate({
        target_id: skill.id,
        type: 'skill_level',
        variant: level,
        name: def.name_sid,
        description: def.desc_sid,
        _data: {
            currentSkillParameter: parameter,
        },
    });
    output.push(...translationDefs);

    for (let i = 0; i < parameter.bonuses.length; i++) {
        const bonus = parameter.bonuses[i];
        const bonusDef = buildBonusDef(bonus, 'skill_level', skill.id + '_L' + level, i);
        output.push(bonusDef);
    }

    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default Skill;
