// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function filter(target, pattern, property) {
    let verify;
    if (typeof pattern === 'string') {
        verify = (text) => text.includes(pattern);
    } else if (pattern instanceof RegExp) {
        verify = (text) => pattern.test(text);
    } else {
        verify = pattern; // assume this is a function
    }

    const hub = {};
    for (const key in target) {
        const value = target[key];
        if (property === 'key') {
            if (verify(key)) {
                hub[key] = value;
            }
        } else {
            if (verify(value)) {
                hub[key] = value;
            }
        }
    }
    return hub;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default filter;
