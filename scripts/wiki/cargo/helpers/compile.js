import assume from '../../../utils/assume.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function compile(text) {
    text = text.replace(/\/\/.*/g, '');
    text = text.replace(/\/\*[\s\S]*?\*\//g, '');
    const output = {};
    const functions = text.split('}');
    functions.pop();
    assume(functions.length > 0, 'No function!');
    for (const functionText of functions) {
        Object.assign(output, compileFunction(functionText));
    }
    return output;
}

// =====================================================================================================================
//  P R I V A T E
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
    assume(checkIdentifier(name), functionText, 'Invalid function name!');
    return {
        [name]: {
            type: headerParts[0],
            body: compileBody(parts[1], name),
        },
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
    assume(checkIdentifier(action), functionName, line, 'Invalid action!');
    const parameters = parts[1].split(',');
    const variable = parameters.shift().trim();
    assume(checkIdentifier(variable), functionName, line, 'Invalid variable!');
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
        } else if (value.match(/^\d+$/)) {
            value = Number(value);
        } else {
            assume(checkIdentifier(value), functionName, line, 'Invalid variable!');
            value = '#' + value;
        }
        output.push(value);
    }
    return output;
}

/**
 *
 */
function checkIdentifier(text) {
    return !!text.match(/^[A-Za-z][A-Za-z0-9_]*$/);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================

export default compile;
