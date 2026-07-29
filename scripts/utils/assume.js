import msg from './msg.js';

/**
 *
 */
const assume = (condition, ...message) => {
    if (!condition) {
        const object = {};
        if (typeof process !== 'undefined') {
            Error.captureStackTrace(object, assume);
            console.log(object.stack); // Note: if we use console.error(), there's a race-condition with console.log()
            console.log(msg.apply(null, message));
            process.exit(1);
        } else {
            throw new Error(msg.apply(null, message));
        }
    }
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default assume;
