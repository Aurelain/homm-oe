import joinLines from '../../utils/joinLines.js';
import parsePage from '../helpers/parsePage.js';
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
    cleaned = cleaned.replaceAll(/\{\{UnitInfobox.*?}}/gi, '');
    cleaned = cleaned.replaceAll(/\{\{UnitStinger.*?}}/gi, '');
    cleaned = cleaned.replaceAll(/\{\{Unitdesc.*?}}/g, '');

    // Temporary:
    // cleaned = cleaned.replaceAll(/\{\{F\|.*?}}/g, '');
    // cleaned = cleaned.replaceAll(/===/g, '==');
    // cleaned = cleaned.replaceAll(/\{\{Specialist.*?}}/gi, '');

    const parsed = parsePage(cleaned);

    // Temporary mutation:
    // delete parsed.sections.Laws;

    const lines = generate(info, translations, context, parsed);
    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default prepare;
