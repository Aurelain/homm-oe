import assume from '../../utils/assume.js';
import fishValue from '../../utils/fishValue.js';
import checkNumber from '../../utils/checkNumber.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const ACTIONS = {
    // key: [function, how many parameters it expects]
    CurrentUnitData: [CurrentUnitData, 1],
    CurrentAbility: [CurrentAbility, 1],
    Add: [Add, -1],
    Mul: [Mul, -1],
    Div: [Div, 2],
    Floor: [Floor, 1],
    Text: [Text, 1],
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function evaluate(functionName, repository, data) {
    assume(functionName in repository, functionName, 'Unknown function!');
    const compiled = repository[functionName];
    assume(compiled.body.at(-1).variable === 'return', compiled, 'Must end with return variable!');
    const vars = {};
    for (const step of compiled.body) {
        const action = step.action;
        const context = {
            data,
            about: action + '@' + functionName,
        };
        const [actionFunction, paramCount] = ACTIONS[action] || [];
        assume(actionFunction, context.about, 'Unknown action!');
        assume(paramCount === -1 || step.params.length === paramCount, context.about, 'Mismatched param count!');
        const params = resolveParams(step.params, vars, context.about);
        params.push(context);
        vars[step.variable] = actionFunction.apply(null, params);
    }
    return vars.return;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function resolveParams(params, vars, about) {
    const output = [];
    for (const param of params) {
        if (typeof param === 'string' && param.charAt(0) === '#') {
            const varName = param.substring(1);
            assume(varName in vars, about, varName, 'Unknown variable!');
            output.push(vars[varName]);
        } else {
            output.push(param);
        }
    }
    return output;
}

/**
 *
 */
function resolveValue(origin, path, about) {
    const value = fishValue(origin, path);
    assume(value !== undefined, about, path, 'Unresolved path!');
    return value;
}

// ---------------------------------------------------------------------------------------------------------------------
/**
 *
 */
function CurrentUnitData(path, context) {
    const json = context.data.currentUnitData;
    assume(json, context.functionName, context.about, 'Missing json "currentUnitData"!');
    const value = resolveValue(json, path, context);
    return value;
}

/**
 *
 */
function CurrentAbility(path, context) {
    const json = context.data.currentAbility;
    assume(json, context.functionName, context.about, 'Missing json "currentAbility"!');
    const value = resolveValue(json, path, context);
    return value;
}

/**
 *
 */
function Add(...members) {
    const {about} = members.pop(); // context
    let result = 0;
    for (const member of members) {
        assume(typeof member === 'number', about, member, 'Expecting number!');
        result += member;
    }
    return result;
}

/**
 *
 */
function Mul(...members) {
    const {about} = members.pop(); // context
    let result = 0;
    for (const member of members) {
        assume(typeof member === 'number', about, member, 'Expecting number!');
        result *= member;
    }
    return result;
}

/**
 *
 */
function Div(numerator, denominator, {about}) {
    assume(checkNumber(numerator), about, numerator, 'Invalid numerator!');
    assume(denominator && checkNumber(denominator), about, denominator, 'Invalid denominator!');
    return numerator / denominator;
}

/**
 *
 */
function Floor(target, {about}) {
    assume(typeof target === 'number', about, target, 'Invalid target!');
    return Math.floor(target);
}

/**
 *
 */
function Text(payload) {
    return payload.toString();
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================

export default evaluate;
