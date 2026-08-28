import joinLines from '../../../utils/joinLines.js';
import parsePage from '../../helpers/parsePage.js';
import generate from './generate.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function prepare(info, translations, context, existingContent) {
    let cleaned = existingContent;

    // Clean header:
    cleaned = cleaned.replaceAll(/\{\{Loc.*?}}/gi, '');
    cleaned = cleaned.replaceAll(/\{\{SkillInfobox[\s\S]*?}}/gi, '');
    cleaned = cleaned.replaceAll(/\{\{SkillsNavbox[\s\S]*?}}/gi, '');
    cleaned = cleaned.replaceAll(/\{\{SkillChances[\s\S]*?}}/gi, '');
    cleaned = cleaned.replaceAll(/__NOTOC__/gi, '');

    // Other cleanings
    cleaned = cleaned.replaceAll(/\{\{#invoke:.*?}}/gi, '');

    // Temporary cleaning:
    // cleaned = cleaned.replaceAll(/foo/gi, '');

    // Parsing:
    const parsed = parsePage(cleaned);
    // console.log('parsed:', parsed);

    // Temporary deletions of sections:
    delete parsed.sections['Skill Synergies'];
    delete parsed.sections['Artifact Effects'];

    const lines = generate(info, translations, context, parsed);
    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default prepare;
