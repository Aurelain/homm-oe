import buildLoc from '../helpers/buildLoc.js';
import buildFooterHeroClass from './buildFooterHeroClass.js';
import joinLines from '../../utils/joinLines.js';
import buildHeroesList from './buildHeroesList.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const MARKER_HEROES = '###MARKER_HEROES';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function handleOldHeroClass(info, translations, existingContent) {
    const cleanedContent = cleanContent(existingContent);

    let adaptedContent = cleanedContent;

    // Header
    const lines = [];
    lines.push(buildLoc(info));
    lines.push('__NOTOC__');
    lines.push('');

    // Middle
    adaptedContent = adaptedContent.replace(MARKER_HEROES, '\n' + buildHeroesList(info, translations) + '\n');
    adaptedContent = adaptedContent.replaceAll(/###\w+/g, '');
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
    content = content.replace(/== ?Heroes.*?==+/, MARKER_HEROES);

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
export default handleOldHeroClass;
