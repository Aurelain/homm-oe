/**
 * Resolves ("evaluates") a path deep inside a json to its value.
 * For alternatives, see:
 * https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
 * https://github.com/capaj/object-resolve-path
 */
function fishValue(origin, path) {
    path = path.replaceAll('[', '.').replaceAll(']', ''); // convert indexes to properties
    path = path.startsWith('.') ? path.substring(1) : path; // strip leading dot
    if (!path) {
        return origin;
    }
    const keys = path.split('.');
    for (const key of keys) {
        if (origin && key in origin) {
            origin = origin[key];
        } else {
            return undefined;
        }
    }
    return origin;
}

export default fishValue;
