import buildLoc from '../helpers/buildLoc.js';
import joinLines from '../../utils/joinLines.js';
import buildInfoBox from './buildInfoBox.js';
import buildFooterHero from './buildFooterHero.js';
import buildStinger from './buildStinger.js';
import buildStrategy from './buildStrategy.js';
import buildBiography from './buildBiography.js';
import buildSpecialization from './buildSpecialization.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function handleFreshHero(info, translations) {
    const lines = [];

    // Header
    lines.push(buildLoc(info));
    lines.push('__NOTOC__');

    // Middle
    lines.push(buildInfoBox(info));
    lines.push(buildStinger(info));
    lines.push(buildSpecialization(info, translations));
    lines.push(buildBiography(info, translations));
    lines.push(buildStrategy(info, translations));

    // Footer
    lines.push(buildFooterHero(info, translations));

    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default handleFreshHero;
