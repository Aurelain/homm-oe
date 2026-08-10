import unzipCore from '../../helpers/unzipCore.js';
import {WIKI_DIR} from '../SETTINGS.js';
import {buildCache} from './helpers/translate.js';
import fs from 'node:fs';
import assume from '../../utils/assume.js';
import Unit from './Unit.js';
import UnitShared from './UnitShared.js';
import UnitLabels from './UnitLabels.js';
import HeroClass from './HeroClass.js';
import Spell from './Spell.js';
import Skill from './Skill.js';
import Artifact from './Artifact.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const parsers = [
    // -- Use this to focus on only some parsers:
    Artifact,
    HeroClass,
    Skill,
    Spell,
    Unit,
    UnitLabels,
    UnitShared,
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
        // console.log('========\n' + path + '\n' + content);
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
    parsingResult.comment && parts.push(parsingResult.comment);
    for (const def of parsingResult) {
        parts.push(convertDefinitionToTemplate(def));
    }
    parts.push(`[[Category:Game Data Import]]`);
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
            return value; // value.trim(); // TODO: restore trim
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
