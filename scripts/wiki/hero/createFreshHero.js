import buildLoc from '../helpers/buildLoc.js';
import joinLines from '../../utils/joinLines.js';
import assume from '../../utils/assume.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function createFreshHero(info, translations) {
    assume(false, 'Cannot create fresh heroes at the moment!');
    const lines = [];
    lines.push(buildLoc(info));
    lines.push('__NOTOC__');
    lines.push('');
    const output = joinLines(lines);
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default createFreshHero;
