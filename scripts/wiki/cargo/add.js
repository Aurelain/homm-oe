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
    destination[key] = value;
}

export default add;
