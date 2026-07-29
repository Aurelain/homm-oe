import assume from '../utils/assume.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const decoder = new TextDecoder();

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function filterHub(hub, pattern, exclude) {
    const output = {};
    for (const key in hub) {
        if (key.match(pattern)) {
            if (exclude && key.match(exclude)) {
                continue;
            }
            const fileData = hub[key];
            const content = decoder.decode(fileData);
            const json = JSON.parse(content);
            assume(Object.keys(json).length === 1, Object.keys(json), 'Unexpected keys!');
            const list = json.array || json.tokens;
            assume(Array.isArray(list), key, json, 'Array required!');
            output[key] = list;
        }
    }
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default filterHub;
