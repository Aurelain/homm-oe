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

    const isArray = Array.isArray(target);
    const hub = isArray ? [] : {};
    for (const key in target) {
        const value = target[key];
        const isAccepted = property === 'key' ? verify(key) : verify(value);
        if (isAccepted) {
            if (isArray) {
                hub.push(value);
            } else {
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
