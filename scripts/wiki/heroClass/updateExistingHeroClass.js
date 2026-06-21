import buildLoc from '../helpers/buildLoc.js';
import buildFooterHeroClass from './buildFooterHeroClass.js';
import joinLines from '../../utils/joinLines.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function updateExistingHeroClass(info, translations, existingContent) {
    const cleanedContent = cleanContent(existingContent);

    let adaptedContent = cleanedContent;

    // Header
    const lines = [];
    lines.push(buildLoc(info));
    lines.push('__NOTOC__');
    lines.push('');

    // Middle
    lines.push(adaptedContent);

    // Footer
    lines.push('');
    lines.push(buildFooterHeroClass(info, translations));

    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
function cleanContent(content) {
    content = content.replaceAll(/\{\{HeroClassNavbox.*?}}/g, '');
    content = content.replaceAll(/\{\{#invoke.*?}}/g, '');
    content = content.replaceAll(/\[\[Category.*?]]/g, '');
    content = content.replaceAll('__NOTOC__', '');
    content = content.replaceAll(/\{\{loc.*?}}/gi, '');
    content = content.trim();
    return content;
}
// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default updateExistingHeroClass;
