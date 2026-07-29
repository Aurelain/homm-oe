import assume from '../../utils/assume.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function compile(text) {
    const output = [];
    const functions = text.split('}');
    functions.pop();
    assume(functions.length > 0, 'No function!');
    for (const functionText of functions) {
        output.push(compileFunction(functionText));
    }
    return output;
}

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function compileFunction(functionText) {
    const parts = functionText.split('{');
    assume(parts.length === 2, functionText, 'Function must have 2 parts!');
    const header = parts[0].trim();
    const headerParts = header.split(' ');
    assume(headerParts.length === 2, functionText, 'Header must have 2 parts!');
    const name = headerParts[1];
    return {
        name,
        type: headerParts[0],
        body: compileBody(parts[1], name),
    };
}

/**
 *
 */
function compileBody(text, functionName) {
    const output = [];
    const lines = text.split(')');
    lines.pop();
    assume(lines.length > 0, functionName, 'No lines!');
    for (const line of lines) {
        output.push(compileLine(line, functionName));
    }
    return output;
}

/**
 *
 */
function compileLine(line, functionName) {
    const parts = line.split('(');
    assume(parts.length === 2, functionName, line, 'Invalid line!');
    const action = parts[0].trim();
    assume(checkLetters(action), functionName, line, 'Invalid action!');
    const parameters = parts[1].split(',');
    const variable = parameters.shift().trim();
    assume(checkLetters(variable), functionName, line, 'Invalid variable!');
    return {
        variable,
        action,
        params: compileParams(parameters, functionName, line),
    };
}

/**
 *
 */
function compileParams(parameters, functionName, line) {
    const output = [];
    for (const param of parameters) {
        let value = param.trim();
        if (value.startsWith('"')) {
            assume(value.endsWith('"'), functionName, line, 'Unexpected quotes!');
            value = value.substring(1, value.length - 1);
            assume(value.match(/^[a-zA-Z\[\]0-9.]+$/), functionName, line, value, 'Invalid accessor!');
        } else if (value.match(/^\d+$/)) {
            value = Number(value);
        } else {
            assume(checkLetters(value), functionName, line, 'Invalid variable!');
            value = '#' + value;
        }
        output.push(value);
    }
    return output;
}

/**
 *
 */
function checkLetters(text) {
    return !!text.match(/^[A-Za-z]+$/);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================

export default compile;
