import buildFooter from './buildFooter.js';
import joinLines from '../../utils/joinLines.js';
import parsePage from '../helpers/parsePage.js';
import buildLaws from './buildLaws.js';
import buildAbilities from './buildAbilities.js';
import buildHeader from './buildHeader.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function handleOldUnit(info, translations, context, existingContent) {
    const {lang} = info;
    const cleanedContent = cleanContent(existingContent);
    const parsed = parsePage(cleanedContent);

    // Remove sections that we're rebuilding completely:
    delete parsed.sections[translations.Laws[lang]];
    delete parsed.sections[translations.Abilities[lang]];

    const lines = [];

    // Header
    lines.push(buildHeader(info, translations, context, parsed.header));

    // Unrecognized sections:
    for (const key in parsed.sections) {
        const value = parsed.sections[key];
        lines.push('');
        lines.push(`==${key}==`);
        lines.push(value);
    }

    // Abilities
    lines.push(buildAbilities(info, translations, context, parsed.ids));

    // Laws
    lines.push(buildLaws(info, translations, context, parsed.ids));

    // Footer
    lines.push('');
    lines.push(buildFooter(info, translations));

    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
function cleanContent(content) {
    content = content.replaceAll(/<!--[\s\S]*?-->/g, ''); // TODO: remove this

    content = content.replaceAll(/\{\{loc.*?}}/gi, '');
    content = content.replaceAll(/\{\{Unit.?Infobox[\s\S]*?}}/gi, '');
    // content = content.replaceAll(/\{\{UnitsNavbox[\s\S]*?}}/gi, '');
    // content = content.replaceAll(/\{\{#invoke:LocUnitData[\s\S]*?}}/gi, '');
    // content = content.replaceAll(/\[\[Category.*?]]/gi, '');
    // content = content.replaceAll('__NOTOC__', '');
    // content = content.replaceAll(/\{\{clear}}/gi, '');
    content = content.trim();
    return content;
}
// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default handleOldUnit;
