/**
 *
 */
function add(destination, key, value, defaultValue) {
    if (value === undefined || value === null) {
        return;
    }
    if (Array.isArray(value) && !value.length) {
        return;
    }
    if (defaultValue !== undefined && String(value) === String(defaultValue)) {
        return;
    }
    if (key.includes('_mult')) {
        // Add a useless zero for parity with Obelisk
        if (typeof value === 'number' && !String(value).includes('.')) {
            value += '.0';
        }
    }
    destination[key] = value;
}

export default add;
