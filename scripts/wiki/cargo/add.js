/**
 *
 */
function add(destination, key, value) {
    if (value === undefined || value === null) {
        return;
    }
    destination[key] = value;
}

export default add;
