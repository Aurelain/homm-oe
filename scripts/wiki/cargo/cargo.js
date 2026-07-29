import unzipCore from '../../helpers/unzipCore.js';
import unit from './unit.js';
import {WIKI_DIR} from '../SETTINGS.js';
import {buildCache} from './translate.js';
import fs from 'node:fs';
import assume from '../../utils/assume.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const parsers = [
    //
    unit,
];

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function cargo() {
    const zipHub = unzipCore();
    buildCache(zipHub);

    const results = {};
    parsers.forEach((parser) => Object.assign(results, parser(zipHub)));

    for (const key in results) {
        const path = WIKI_DIR + '/Data/' + key + '.wiki';
        const content = prepareContent(results[key]);
        // console.log('content:', content);
        fs.writeFileSync(path, content);
    }
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function prepareContent(parsingResult) {
    const parts = [];
    parts.push(`<!-- Bot-managed page. Edit the source in obelisk-bot, not here. -->`);
    for (const def of parsingResult.defs) {
        parts.push(convertDefinitionToTemplate(def));
    }
    parts.push(parsingResult.footer);
    return parts.join('\n\n').trim();
}

/**
 *
 */
function convertDefinitionToTemplate(definition) {
    const lines = [];
    lines.push(`{{${definition._type}`);
    delete definition._type; // mutation
    for (const key in definition) {
        lines.push(`| ${key.trim()} = ${convertValue(definition[key])}`);
    }
    lines.push('}}');
    return lines.join('\n');
}

/**
 *
 */
function convertValue(value) {
    switch (typeof value) {
        case 'boolean':
            return value ? 'yes' : 'no';
        case 'string':
            return value.trim();
        case 'number':
            return value.toString();
        default:
            assume(Array.isArray(value), value, 'Unexpected type!');
            return value.join(',');
    }
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
cargo();
