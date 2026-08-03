import fs from 'node:fs';
import match from '../../utils/match.js';
import assume from '../../utils/assume.js';
import parseDefinition from './parseDefinition.js';

const MAIN_PROPS = new Set(['name', 'description']);

const FIX_LANGUAGE_CODE = {
    zh_cn: 'zh-hans',
    zh_tw: 'zh-hant',
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function parseTranslationFile(path) {
    const content = fs.readFileSync(path, 'utf8');
    if (content.match(/^[^}]*unused = yes/)) {
        // console.log(`Unused item at "${path}"! Skipping it.`);
        return;
    }
    const definitionsFound = match(content, /\{\{TranslationDef[\s\S]*?}}/g);
    if (!definitionsFound.length) {
        // console.log(`No translations in "${path}"! Skipping it.`);
        return;
    }
    const hub = {};
    for (const definitionFound of definitionsFound) {
        const [definitionText] = definitionFound;
        const definition = parseDefinition(definitionText);
        assume(definition.target_id, definition, 'Unexpected target_id!');
        assume(definition.language, definition, 'Unexpected language!');
        assume(definition.name || definition.description, definition, 'No actual content!');
        definition.language = FIX_LANGUAGE_CODE[definition.language] || definition.language;

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
