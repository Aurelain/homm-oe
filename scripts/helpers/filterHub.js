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
function filterHub(hub, pattern, exclude = null, directResult = false) {
    const output = {};
    for (const key in hub) {
        if (key.match(pattern)) {
            if (exclude && key.match(exclude)) {
                continue;
            }
            const fileData = hub[key];
            const content = decoder.decode(fileData);
            if (content.match(/^\s*[{[]/)) {
                const json = JSON.parse(content);
                const topKeys = Object.keys(json);
                assume(topKeys.length === 1, Object.keys(json), 'Unexpected keys!');
                const list = json[topKeys[0]];
                assume(Array.isArray(list), key, 'Array required!');
                output[key] = list;
            } else {
                output[key] = content;
            }
        }
    }
    if (directResult) {
        const value = Object.values(output)[0];
        assume(value, pattern, 'Cannot offer a direct result for this pattern!');
        return value;
    }
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default filterHub;
