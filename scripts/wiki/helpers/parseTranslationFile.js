import fs from 'node:fs';
import match from '../../utils/match.js';
import assume from '../../utils/assume.js';

const MAIN_PROPS = new Set(['name', 'description']);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function parseTranslationFile(path) {
    const content = fs.readFileSync(path, 'utf8');
    const definitionsFound = match(content, /\{\{TranslationDef[\s\S]*?}}/g);
    assume(definitionsFound.length > 1, path, 'Unexpected results!');
    const hub = {};
    for (const definitionFound of definitionsFound) {
        const [definitionText] = definitionFound;
        const definition = parseDefinition(definitionText);

        const signature = generateSignature(definition);
        if (!hub[signature]) {
            hub[signature] = {...definition};
            for (const prop of MAIN_PROPS) {
                delete hub[signature][prop];
            }
        }
        const entry = hub[signature];

        for (const prop of MAIN_PROPS) {
            const value = definition[prop];
            if (value) {
                entry[prop] = entry[prop] || {};
                entry[prop][definition.language] = value;
            }
        }
    }
    return Object.values(hub);
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function parseDefinition(definitionText) {
    const lines = match(definitionText, /\| (\w+) = ([^|}]*)/g);
    const output = {};
    for (const line of lines) {
        const [, prop, value] = line;
        output[prop] = value.trim();
    }
    assume(output.target_id, output, 'Unexpected target_id!');
    assume(output.language, output, 'Unexpected language!');
    assume(output.name || output.description, output, 'No actual content!');
    return output;
}

/**
 *
 */
function generateSignature(target) {
    const parts = [];
    for (const key in target) {
        if (key !== 'language' && key !== 'name' && key !== 'description') {
            parts.push(key + '=' + target[key]);
        }
    }
    return parts.join('\n');
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default parseTranslationFile;
