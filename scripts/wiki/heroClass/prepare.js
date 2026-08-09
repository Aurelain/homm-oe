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
    cleaned = cleaned.replaceAll(/\{\{HeroClassInfobox[\s\S]*?}}/gi, '');
    cleaned = cleaned.replaceAll(/\{\{SubClassTable[\s\S]*?}}/gi, '');
    cleaned = cleaned.replaceAll(/__NOTOC__/gi, '');

    // Other cleanings
    cleaned = cleaned.replaceAll(/\{\{#invoke:HeroesOverview.*?}}/gi, '');

    // Temporary cleaning:

    const parsed = parsePage(cleaned);
    // console.log('parsed:', parsed);

    // Temporary deletions of sections:

    const lines = generate(info, translations, context, parsed);
    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default prepare;
