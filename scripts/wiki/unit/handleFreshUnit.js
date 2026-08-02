import joinLines from '../../utils/joinLines.js';
import buildFooter from './buildFooter.js';
import buildLaws from './buildLaws.js';
import buildAbilities from './buildAbilities.js';
import buildHeader from './buildHeader.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function handleFreshUnit(info, translations, context) {
    const lines = [];

    // Header
    lines.push(buildHeader(info, translations, context));

    // Abilities
    lines.push(buildAbilities(info, translations, context));

    // Laws
    lines.push(buildLaws(info, translations, context));

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
