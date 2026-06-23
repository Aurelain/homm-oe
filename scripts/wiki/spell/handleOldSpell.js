import buildLoc from '../helpers/buildLoc.js';
import buildFooterSpell from './buildFooterSpell.js';
import joinLines from '../../utils/joinLines.js';
import getWords from '../helpers/getWords.js';
import parsePage from '../helpers/parsePage.js';
import buildInfoBox from './buildInfoBox.js';
import buildStinger from './buildStinger.js';
import buildStrategy from './buildStrategy.js';
import buildHeading from '../helpers/buildHeading.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function handleOldSpell(info, translations, existingContent) {
    const {lang} = info;
    const zones = {
        specialization: getWords('Specialization', translations, lang),
        biography: getWords('Biography', translations, lang),
        strategy: getWords('Strategy', translations, lang),
    };
    const cleanedContent = cleanContent(existingContent);
    const parsed = parsePage(cleanedContent, zones);

    const lines = [];
    lines.push(buildLoc(info));
    lines.push('__NOTOC__');
    lines.push('');

    lines.push(buildInfoBox(info));
    lines.push(buildStinger(info));
    parsed.header && lines.push(parsed.header);

    if (parsed.zones.strategy) {
        lines.push(buildHeading('Strategy', translations, lang));
        lines.push(parsed.zones.strategy);
    } else {
        lines.push(buildStrategy(info, translations));
    }

    parsed.footer && lines.push(parsed.footer);

    lines.push('');
    lines.push(buildFooterSpell(info, translations));

    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
function cleanContent(content) {
    content = content.replaceAll(/\{\{Template:HeroInfoBox.*?}}/gi, '');
    content = content.replaceAll(/\{\{HeroStinger.*?}}/gi, '');
    content = content.replaceAll(/\{\{Specialization.*?}}/gi, '');
    content = content.replaceAll(/\{\{Biography.*?}}/gi, '');
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
export default handleOldSpell;
