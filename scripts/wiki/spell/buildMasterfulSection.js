import buildHeading from '../helpers/buildHeading.js';
import joinLines from '../../utils/joinLines.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildMasterfulSection({lang, id, masterfulHero}, translations) {
    const lines = [];
    lines.push('');
    lines.push(buildHeading('Specialist', translations, lang));
    lines.push('');
    return joinLines(lines);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildMasterfulSection;
