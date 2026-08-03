import joinLines from '../../utils/joinLines.js';
import parsePage from '../helpers/parsePage.js';
import buildSpell from './buildSpell.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function prepareSpell(info, translations, context, existingContent) {
    let cleaned = existingContent;

    // Clean header:
    cleaned = cleaned.replaceAll(/\{\{Loc.*?}}/gi, '');
    cleaned = cleaned.replaceAll(/\{\{Template:SpellInfobox.*?}}/gi, '');
    cleaned = cleaned.replaceAll(/\{\{SpellInfobox.*?}}/gi, '');
    cleaned = cleaned.replaceAll(/\{\{SpellStinger.*?}}/gi, '');

    // Temporary:
    cleaned = cleaned.replaceAll(/===/g, '==');
    cleaned = cleaned.replaceAll(/\{\{Specialist.*?}}/gi, '');

    const parsed = parsePage(cleaned);

    const lines = buildSpell(info, translations, context, parsed);
    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default prepareSpell;
