import buildLoc from '../helpers/buildLoc.js';
import buildFooterHero from './buildFooterHero.js';
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
function handleOldHero(info, translations, existingContent) {
    const cleanedContent = cleanContent(existingContent);

    let adaptedContent = cleanedContent;

    const lines = [];
    lines.push(buildLoc(info));
    lines.push('__NOTOC__');
    lines.push('');

    lines.push(adaptedContent);

    lines.push('');
    lines.push(buildFooterHero(info, translations));

    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
function cleanContent(content) {
    content = content.replaceAll(/\{\{\w*HeroesNavbox.*?}}/gi, '');
    content = content.replaceAll(/\[\[Category.*?]]/gi, '');
    content = content.replaceAll('__NOTOC__', '');
    content = content.replaceAll('----', '');
    content = content.replaceAll(/\{\{clear}}/gi, '');
    content = content.replaceAll(/\{\{loc.*?}}/gi, '');
    content = content.trim();
    return content;
}
// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default handleOldHero;
