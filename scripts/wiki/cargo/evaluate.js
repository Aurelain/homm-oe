import assume from '../../utils/assume.js';
import fishValue from '../../utils/fishValue.js';
import checkNumber from '../../utils/checkNumber.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const ACTIONS = {
    // key: [function, how many parameters it expects]
    CurrentUnitData: [CurrentUnitData, 1],
    CurrentUnitConfig: [CurrentUnitConfig, 1],
    CurrentUnitStats: [CurrentUnitStats, 1],
    CurrentAbility: [CurrentAbility, 1],
    CurrentHero: [CurrentHero, 1],
    Add: [Add, 2],
    Sub: [Sub, 2],
    Mul: [Mul, 2],
    Div: [Div, 2],
    Avg: [Avg, 2],
    Floor: [Floor, 1],
    Text: [Text, 1],
    DbBuff: [DbBuff, 2],
    Invoke: [Invoke, 1],
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function evaluate(functionName, repository, data, isDebug = false) {
    isDebug && console.log(`${functionName}():`);
    assume(functionName in repository, functionName, 'Unknown function!');
    const compiled = repository[functionName];
    assume(compiled.body.at(-1).variable === 'return', compiled, 'Must end with return variable!');
    const vars = {};
    for (const step of compiled.body) {
        const action = step.action;
        const context = {
            data,
            about: action,
            repository,
            isDebug,
        };
        const [actionFunction, paramCount] = ACTIONS[action] || [];
        assume(actionFunction, step, context.about, 'Unknown action!');
        assume(paramCount === -1 || step.params.length === paramCount, context.about, 'Mismatched param count!');
        const params = resolveParams(step.params, vars, context.about);
        params.push(context);
        vars[step.variable] = actionFunction.apply(null, params);
        isDebug && console.log(context.about, step.params, JSON.stringify(vars, null, 4));
    }
    return formatValue(vars.return, compiled.type);
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
function resolveValue(origin, path, context) {
    const value = fishValue(origin, path);
    assume(value !== undefined, origin, context.about, path, 'Unresolved path!');
    return value;
}

/**
 *
 */
function formatValue(value, type) {
    switch (type) {
        case 'int':
            return Math.round(value);
        case 'modInt':
            return Math.abs(Math.round(value));
        case 'modPercentNumeric':
            return Math.abs(value * 100);
        case 'string':
            return String(value);
        default:
            assume(false, type, 'Unknown type!');
    }
}

// ---------------------------------------------------------------------------------------------------------------------
/**
 *
 */
function CurrentUnitData(path, context) {
    const json = context.data.currentUnitData;
    assume(json, context.about, 'Missing "currentUnitData"!');
    const value = resolveValue(json, path, context);
    return value;
}

/**
 *
 */
function CurrentUnitConfig(path, context) {
    const json = context.data.currentUnitConfig;
    assume(json, context.about, 'Missing "currentUnitConfig"!');
    const value = resolveValue(json, path, context);
    return value;
}

/**
 *
 */
function CurrentUnitStats(prop, context) {
    const json = context.data.currentUnitConfig;
    assume(json, context.about, 'Missing "currentUnitConfig"!');
    const value = resolveValue(json, 'stats.' + prop, context);
    return value;
}

/**
 *
 */
function CurrentAbility(path, context) {
    const json = context.data.currentAbility;
    assume(json, context.about, 'Missing "currentAbility"!');
    const value = resolveValue(json, path, context);
    return value;
}

/**
 *
 */
function CurrentHero(path, context) {
    const json = context.data.currentHero;
    assume(json, context.about, 'Missing "currentHero"!');
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
        const nr = Number(member);
        assume(checkNumber(nr), about, member, 'Expecting number!');
        result += nr;
    }
    return result;
}

/**
 *
 */
function Sub(...members) {
    const {about} = members.pop(); // context
    let result = 0;
    for (const member of members) {
        const nr = Number(member);
        assume(checkNumber(nr), about, member, 'Expecting number!');
        result -= nr;
    }
    return result;
}

/**
 *
 */
function Mul(...members) {
    const {about} = members.pop(); // context
    let result = 1;
    for (const member of members) {
        const nr = Number(member);
        assume(checkNumber(nr), about, member, 'Expecting number!');
        result *= nr;
    }
    return result;
}

/**
 *
 */
function Div(numerator, denominator, {about}) {
    numerator = Number(numerator);
    if (numerator === 0) {
        return 0;
    }
    denominator = Number(denominator);
    assume(checkNumber(numerator), about, numerator, 'Invalid numerator!');
    assume(denominator && checkNumber(denominator), about, denominator, 'Invalid denominator!');
    return numerator / denominator;
}

/**
 *
 */
function Avg(...members) {
    const {about} = members.pop(); // context
    let result = 0;
    for (const member of members) {
        const nr = Number(member);
        assume(checkNumber(nr), about, member, 'Expecting number!');
        result += nr;
    }
    return result / members.length;
}

/**
 *
 */
function Floor(target, {about}) {
    target = Number(target);
    assume(typeof target === 'number', about, target, 'Invalid target!');
    return Math.floor(target);
}

/**
 *
 */
function Text(payload) {
    return payload.toString();
}

/**
 *
 */
function DbBuff(buffSid, path, context) {
    const {buffs} = context.data;
    assume(buffs, context.about, 'Missing "buffs"!');

    const buff = buffs[buffSid];
    assume(buff, context.about, buffSid, 'No such buff!');

    const value = resolveValue(buff, path, context);
    return value;
}

/**
 *
 */
function Invoke(functionName, context) {
    const {repository, data, isDebug} = context;
    assume(repository[functionName], context.about, functionName, 'No such function to invoke!');
    return evaluate(functionName, repository, data, isDebug);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================

export default evaluate;
