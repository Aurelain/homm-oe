import assume from '../../../utils/assume.js';
import fishValue from '../../../utils/fishValue.js';
import checkNumber from '../../../utils/checkNumber.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const ACTIONS = {
    // key: [function, how many parameters it expects]
    CurrentUnitData: [handleHomonymousAction, 1],
    CurrentUnitConfig: [handleHomonymousAction, 1],
    CurrentUnitStats: [handleHomonymousAction, 1],
    CurrentAbility: [handleHomonymousAction, 1],
    CurrentHero: [handleHomonymousAction, 1],
    CurrentMagicBattleRoot: [handleHomonymousAction, 1],
    CurrentMagicBattle: [handleHomonymousAction, 1],
    CurrentMagicWorld: [handleHomonymousAction, 1],
    CurrentSkillParameter: [handleHomonymousAction, 1],
    CurrentSubSkill: [handleHomonymousAction, 1],
    CurrentItem: [handleHomonymousAction, 1],
    CurrentHeroSpecializationConfig: [handleHomonymousAction, 1],
    CurrentItemSet: [handleHomonymousAction, 1],
    CurrentFractionLawConfig: [handleHomonymousAction, 1],
    SpellpowerForCurrentMagic: [SpellpowerForCurrentMagic, 0],
    CurrentMagicLevel: [CurrentMagicLevel, 0],
    CurrentSkillLevel: [CurrentSkillLevel, 0],
    Add: [Add, 2],
    Sub: [Sub, 2],
    Mul: [Mul, 2],
    Div: [Div, 2],
    Avg: [Avg, 2],
    Floor: [Floor, 1],
    Text: [Text, 1],
    DbBuff: [DbBuff, 2],
    DbSideBuff: [DbSideBuff, 2],
    DbObstacle: [DbObstacle, 2],
    DbTrap: [DbTrap, 2],
    DbAbility: [DbAbility, 3],
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
            action,
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
            return Math.floor(value); // Note: crossbowman_upg_alt needs a 1-2 interval!
        case 'modInt':
            return Math.abs(Math.round(value));
        case 'modPercentNumeric':
            let modPercentNumeric = Math.round(Math.abs(value * 100));
            modPercentNumeric = isNaN(modPercentNumeric) ? value : modPercentNumeric; // for parity with Obelisk
            return modPercentNumeric;
        case 'modFloatPercentF1Numeric':
            const s = Math.abs(value * 100).toFixed(1);
            return s.includes('.') ? s.replace(/\.0$/, '') : s;
        case 'string':
            return String(value);
        default:
            assume(false, type, 'Unknown type!');
    }
}

/**
 *
 */
function handleHomonymousAction(path, context) {
    const {action} = context;
    const json = context.data[action];
    assume(json, context.about, `Missing "${action}" from data!`);
    const value = resolveValue(json, path, context);
    return value;
}

// ---------------------------------------------------------------------------------------------------------------------
/**
 *
 */
function SpellpowerForCurrentMagic() {
    return 1; // TODO: what should we use here?
}

/**
 *
 */
function CurrentMagicLevel(context) {
    return context.data.CurrentMagicLevel;
}

/**
 *
 */
function CurrentSkillLevel(context) {
    return context.data.CurrentSkillLevel;
}

/**
 *
 */
function Add(a, b, context) {
    a = Number(a);
    b = Number(b);
    assume(checkNumber(a), context.about, a, 'Expecting number!');
    assume(checkNumber(b), context.about, b, 'Expecting number!');
    return a + b;
}

/**
 *
 */
function Sub(a, b, context) {
    a = Number(a);
    b = Number(b);
    assume(checkNumber(a), context.about, a, 'Expecting number!');
    assume(checkNumber(b), context.about, b, 'Expecting number!');
    return a - b;
}

/**
 *
 */
function Mul(a, b, context) {
    a = Number(a);
    b = Number(b);
    assume(checkNumber(a), context.about, a, 'Expecting number!');
    assume(checkNumber(b), context.about, b, 'Expecting number!');
    return a * b;
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
    const buff = buffs[buffSid];
    assume(buff, context.about, buffSid, 'No such buff!');

    const value = resolveValue(buff, path, context);
    return value;
}

/**
 *
 */
function DbSideBuff(sideBuffSid, path, context) {
    const {buffs, sideBuffs} = context.data;
    const sideBuff = sideBuffs[sideBuffSid];
    assume(sideBuff, context.about, sideBuffSid, 'No such sideBuff!');
    const buff = buffs[sideBuff.sid];
    assume(buff, context.about, sideBuff.sid, 'No such buff!');

    const value = resolveValue(buff, path, context);
    return value;
}

/**
 *
 */
function DbObstacle(summonSid, path, context) {
    const {obstacles} = context.data;
    const obstacle = obstacles[summonSid];
    assume(obstacle, context.about, summonSid, 'No such obstacle!');

    const value = resolveValue(obstacle, path, context);
    return value;
}

/**
 *
 */
function DbTrap(summonSid, path, context) {
    const {traps} = context.data;
    const trap = traps[summonSid];
    assume(trap, context.about, summonSid, 'No such trap!');

    const value = resolveValue(trap, path, context);
    return value;
}

/**
 *
 */
function DbAbility(abilitySid, abilityLevel, path, context) {
    const {abilities} = context.data;
    const ability = abilities[abilitySid];
    assume(ability, context.about, abilitySid, abilityLevel, 'No such ability!');
    const level = ability.levels[abilityLevel];
    assume(level, context.about, abilitySid, abilityLevel, 'No such level!');
    const value = resolveValue(level, path, context);
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
