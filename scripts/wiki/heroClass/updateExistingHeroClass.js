import buildLoc from '../helpers/buildLoc.js';
import buildCategoryHeroClass from './buildCategoryHeroClass.js';
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

    const lines = [];
    lines.push(buildLoc(info));
    lines.push('__NOTOC__');
    lines.push('');

    lines.push(adaptedContent);

    lines.push('');
    lines.push(buildCategoryHeroClass(info, translations));

    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
function cleanContent(content) {
    content = content.replaceAll(/\{\{HeroesNavbox.*?}}/g, '');
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
