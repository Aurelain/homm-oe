import buildLoc from '../helpers/buildLoc.js';
import joinLines from '../../utils/joinLines.js';
import buildInfoBox from './buildInfoBox.js';
import buildFooter from './buildFooter.js';
import buildLaws from './buildLaws.js';

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

    // Laws
    buildLaws(info, translations);

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
