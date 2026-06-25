import fs from 'node:fs';
import {WIKI_DIR} from '../SETTINGS.js';
import walk from '../../utils/walk.js';
import match from '../../utils/match.js';
import assume from '../../utils/assume.js';
import cloneDeep from '../../utils/cloneDeep.js';
import parseDefinition from '../helpers/parseDefinition.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================

/**
 *
 */
function translations() {
    const paths = walk(WIKI_DIR + '/Data', 'WikiTranslations~');
    const hubs = {};
    for (const path of paths) {
        const lang = path.match(/~(\w+)/)[1];
        const hub = parseFile(path);
        hubs[lang] = hub;
    }
    const hub = consolidate(hubs.en, hubs);
    const hierarchy = createHierarchy();
    for (const path of paths) {
        writeHierarchyToFile(hierarchy, path, hub);
    }
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function parseFile(path) {
    const content = fs.readFileSync(path, 'utf8');
    const definitionsFound = match(content, /\{\{WikiTranslation[\s\S]*?\n}}/g);
    assume(definitionsFound.length > 1, path, 'Unexpected results!');
    const hub = {};
    for (const definitionFound of definitionsFound) {
        const definition = parseDefinition(definitionFound[0]);
        assume(definition.subtype, definition, 'Unexpected subtype!');
        assume(definition.target_id, definition, 'Unexpected target_id!');
        assume(definition.en, definition, 'Unexpected en!');
        assume(typeof definition.name === 'string', definition, 'Unexpected name!');

        const {target_id} = definition;
        assume(!hub[target_id], definition, 'Id collision!');
        hub[target_id] = definition;
    }
    return hub;
}

/**
 *
 */
function consolidate(englishHub, allHubs) {
    const consolidated = cloneDeep(englishHub);
    for (const lang in allHubs) {
        const hub = allHubs[lang];
        for (const key in hub) {
            const definition = hub[key];
            const entry = consolidated[key];
            assume(entry, definition, 'Id from foreign language has no English equivalent!');
            entry.byLang = entry.byLang || {};
            entry.byLang[lang] = definition.name;
        }
    }
    return consolidated;
}

/**
 *
 */
function createHierarchy() {
    const hierarchy = [];
    const englishContent = fs.readFileSync(WIKI_DIR + '/Data/WikiTranslations~en.wiki', 'utf8');
    const parts = match(englishContent, /==(.*?)==[^#]*/g);
    for (const part of parts) {
        const [section, sectionTitle] = part;
        const category = sectionTitle.trim();
        const ids = [];
        const targetsFound = match(section, /target_id ?=(.*)/g);
        for (const targetFound of targetsFound) {
            const [, target_id] = targetFound;
            ids.push(target_id.trim());
        }
        hierarchy.push({category, ids});
    }
    return hierarchy;
}

/**
 *
 */
function writeHierarchyToFile(hierarchy, path, hub) {
    const lines = [];
    lines.push('{{Loc}}');
    const lang = path.match(/~(\w+)/)[1];
    for (const {category, ids} of hierarchy) {
        lines.push('<!--############################################-->');
        lines.push(`== ${category} ==`);
        for (const id of ids) {
            const entry = hub[id];
            let name = entry.byLang[lang];
            if (!name || name.includes('💬')) {
                name = entry.byLang.en + '💬';
            }
            lines.push('<!------------------------------------------------>');
            lines.push(`{{WikiTranslation | subtype = ${entry.subtype}`);
            lines.push(`| target_id = ${entry.target_id}`);
            lines.push(`| en = ${entry.byLang.en}`);
            lines.push(`| name = ${name}`);
            lines.push('}}');
        }
    }
    lines.push('');
    lines.push('[[Category: Wiki Translations]]');
    const content = lines.join('\n');
    fs.writeFileSync(path, content);
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await translations();
