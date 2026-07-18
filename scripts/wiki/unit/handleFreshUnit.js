import buildLoc from '../helpers/buildLoc.js';
import joinLines from '../../utils/joinLines.js';
import buildInfoBox from './buildInfoBox.js';
import buildFooter from './buildFooter.js';
import buildStinger from './buildStinger.js';
import buildStrategy from './buildStrategy.js';
import buildInteractions from './buildInteractions.js';
import buildSpecialist from './buildSpecialist.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function handleFreshUnit(info, translations) {
    const lines = [];

    // Header
    lines.push(buildLoc(info));
    lines.push(buildInfoBox(info));

    // Footer
    lines.push('');
    lines.push(buildFooter(info, translations));

    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default handleFreshUnit;
