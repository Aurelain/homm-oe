import buildLoc from '../helpers/buildLoc.js';
import joinLines from '../../utils/joinLines.js';
import buildInfoBox from './buildInfoBox.js';
import buildFooterSpell from './buildFooterSpell.js';
import buildStinger from './buildStinger.js';
import buildStrategy from './buildStrategy.js';
import buildInteractions from './buildInteractions.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function handleFreshSpell(info, translations) {
    const lines = [];

    // Header
    lines.push(buildLoc(info));
    lines.push('__NOTOC__');

    // Middle
    lines.push(buildInfoBox(info));
    lines.push(buildStinger(info));
    // if (info.masterfulFragment) {
    //     lines.push(buildMasterfulSection(info));
    // }
    lines.push(buildInteractions(info, translations));
    lines.push(buildStrategy(info, translations));

    // Footer
    lines.push(buildFooterSpell(info, translations));

    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default handleFreshSpell;
