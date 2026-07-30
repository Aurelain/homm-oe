/**
 *
 */
function add(destination, key, value) {
    if (value === undefined || value === null) {
        return;
    }
    if (Array.isArray(value) && !value.length) {
        return;
    }
    destination[key] = value;
}

export default add;
