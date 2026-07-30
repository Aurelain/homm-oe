// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function mergeDeep(destination, incoming) {
    // Safe fallbacks for non-POJO inputs
    if (!isPojo(destination)) {
        destination = {};
    }
    if (!isPojo(incoming)) {
        return {...destination};
    }

    const result = {...destination};

    for (const key of Object.keys(incoming)) {
        const destVal = destination[key];
        const incVal = incoming[key];

        if (isPojo(destVal) && isPojo(incVal)) {
            // Both POJOs -> Recursive merge
            result[key] = mergeDeep(destVal, incVal);
        } else if (Array.isArray(destVal) && Array.isArray(incVal)) {
            // Both Arrays -> Merge element, by element, by index
            const maxLen = Math.max(destVal.length, incVal.length);
            const mergedArr = [];

            for (let i = 0; i < maxLen; i++) {
                const dItem = destVal[i];
                const iItem = incVal[i];

                if (i in incVal) {
                    if (isPojo(dItem) && isPojo(iItem)) {
                        // Both items at index i are POJOs -> Deep merge them
                        mergedArr[i] = mergeDeep(dItem, iItem);
                    } else {
                        // Primitive/New item in incoming -> Overwrite or set
                        mergedArr[i] = isPojo(iItem) ? mergeDeep({}, iItem) : iItem;
                    }
                } else {
                    // Beyond incoming array bounds -> Keep remaining destination items
                    mergedArr[i] = isPojo(dItem) ? mergeDeep({}, dItem) : dItem;
                }
            }

            result[key] = mergedArr;
        } else if (isPojo(incVal)) {
            // Incoming is POJO, target isn't -> Deep clone incoming
            result[key] = mergeDeep({}, incVal);
        } else {
            // Primitive, array-over-non-array, or non-POJO -> Overwrite
            result[key] = Array.isArray(incVal) ? incVal.slice() : incVal;
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
