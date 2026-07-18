import buildLoc from '../helpers/buildLoc.js';
import buildFooterSpell from './buildFooterSpell.js';
import joinLines from '../../utils/joinLines.js';
import getWords from '../helpers/getWords.js';
import parsePage from '../helpers/parsePage.js';
import buildInfoBox from './buildInfoBox.js';
import buildStinger from './buildStinger.js';
import buildStrategy from './buildStrategy.js';
import buildHeading from '../helpers/buildHeading.js';
import buildInteractions from './buildInteractions.js';
import buildSpecialist from './buildSpecialist.js';
import match from '../../utils/match.js';

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
    const [, previousMasterful] = match(existingContent, /masterful=([^}]+)/);
    const cleanedContent = cleanContent(existingContent);
    const parsed = parsePage(cleanedContent, {
        strategy: getWords('Strategy', translations, lang),
        interactions: getWords('Interactions', translations, lang),
        specialist: getWords('Specialist', translations, lang),
    });

    const lines = [];

    // Header
    lines.push(buildLoc(info));
    lines.push(buildInfoBox(info, previousMasterful));
    lines.push(buildStinger(info));
    if (parsed.header) {
        lines.push('');
        lines.push(parsed.header);
    }

    // Specialist
    if (info.masterfulFragment) {
        lines.push('');
        lines.push(buildSpecialist(info, translations));
        if (parsed.zones.specialist) {
            lines.push(parsed.zones.specialist);
        }
    }

    // Interactions
    // lines.push('');
    // if (parsed.zones.interactions) {
    //     lines.push(buildHeading('Interactions', translations, lang));
    //     lines.push(parsed.zones.interactions);
    // } else {
    //     lines.push(buildInteractions(info, translations));
    // }

    // Strategy
    lines.push('');
    if (parsed.zones.strategy) {
        lines.push(buildHeading('Strategy', translations, lang));
        lines.push(parsed.zones.strategy);
    } else {
        lines.push(buildStrategy(info, translations));
    }

    // Footer
    if (parsed.footer) {
        lines.push('');
        lines.push(parsed.footer);
    }

    lines.push('');
    lines.push(buildFooterSpell(info, translations));

    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
function cleanContent(content) {
    content = content.replaceAll(/\{\{#invoke.*?}}/gi, '');
    content = content.replaceAll(/\{\{Specialist.*?}}/gi, '');
    content = content.replaceAll(/\{\{Template:SpellInfobox.*?}}/gi, '');
    content = content.replaceAll(/\{\{SpellStinger.*?}}/gi, '');
    content = content.replaceAll(/\{\{SpellsNavbox.*?}}/gi, '');
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
