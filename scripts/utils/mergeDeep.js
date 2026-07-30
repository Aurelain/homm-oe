// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function mergeDeep(destination, incoming) {
    // 1. Handle non-POJO destination safely
    if (!isPojo(destination)) {
        destination = {};
    }

    // 2. Start with a clone of destination (preserves non-overlapping keys)
    const result = {...destination};

    // 3. If incoming isn't a POJO, return the destination clone
    if (!isPojo(incoming)) {
        return result;
    }

    for (const key of Object.keys(incoming)) {
        const destVal = destination[key];
        const incVal = incoming[key];

        if (isPojo(destVal) && isPojo(incVal)) {
            // Both are POJOs -> merge recursively
            result[key] = mergeDeep(destVal, incVal);
        } else if (Array.isArray(incVal)) {
            // Incoming is an array -> slice to copy (overwrites target array)
            result[key] = incVal.slice();
        } else if (isPojo(incVal)) {
            // Destination wasn't a POJO, but incoming is -> recursive clone
            result[key] = mergeDeep({}, incVal);
        } else {
            // Primitive or non-POJO (Functions, Dates, etc.) -> overwrite
            result[key] = incVal;
        }
    }

    return result;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function isPojo(obj) {
    return obj !== null && typeof obj === 'object' && obj.constructor === Object;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default mergeDeep;
