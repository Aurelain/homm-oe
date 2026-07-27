import buildLoc from '../helpers/buildLoc.js';
import buildFooter from './buildFooter.js';
import joinLines from '../../utils/joinLines.js';
import parsePage from '../helpers/parsePage.js';
import buildInfoBox from './buildInfoBox.js';
import buildLaws from './buildLaws.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function handleOldUnit(info, translations, existingContent) {
    const {lang} = info;
    const cleanedContent = cleanContent(existingContent);
    const parsed = parsePage(cleanedContent);

    // Remove the Laws section because we're rebuilding it completely:
    delete parsed.sections[translations.Laws[lang]];

    const lines = [];

    // Header
    lines.push(buildLoc(info));
    lines.push(buildInfoBox(info));
    if (parsed.header) {
        lines.push('');
        lines.push(parsed.header);
    }

    // Unrecognized sections:
    for (const key in parsed.sections) {
        const value = parsed.sections[key];
        lines.push('');
        lines.push(`==${key}==`);
        lines.push(value);
    }

    // Laws
    lines.push(buildLaws(info, translations, parsed.ids));

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
    // content = content.replaceAll(/\{\{#invoke:LocUnitData\|navBox[\s\S]*?}}/gi, '');
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
