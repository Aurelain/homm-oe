import match from '../../utils/match.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function parseDefinition(definitionText) {
    definitionText = definitionText.replace(/}}\s*$/, '');
    const lines = match(definitionText, /\|\s*(\w+)\s*=\s*([^|]*)/g);
    const output = {};
    for (const line of lines) {
        const [, prop, value] = line;
        output[prop] = value.trim();
    }
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default parseDefinition;
