import suggestFileNames from './suggestFileNames.js';
import fs from 'node:fs';
import {WIKI_DIR} from '../SETTINGS.js';
import convertFileNameToWikiUrl from './convertFileNameToWikiUrl.js';
import {join} from 'node:path';
import {spawn} from 'node:child_process';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const EXTERNAL_SCRIPT = join(import.meta.dirname, '../../../../mirror-wiki/scripts/purge/purge.js');
const SETTINGS_PATH = join(import.meta.dirname, '../../../../oe-wiki/WIKI.json');
const PURGE_LIST = join(import.meta.dirname, '/purge.json');

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function purge(items, targetLanguages, switcheroos) {
    items = filterItemsByLanguage(items, targetLanguages);

    const fileNames = suggestFileNames(items, switcheroos);

    const titles = [];
    for (const key in fileNames) {
        const value = fileNames[key];
        if (fs.existsSync(WIKI_DIR + '/Main/' + value)) {
            const title = convertFileNameToWikiUrl(fileNames[key]);
            titles.push(title);
        }
    }
    fs.writeFileSync(PURGE_LIST, JSON.stringify(titles, null, 4));
    const child = spawn('node', [EXTERNAL_SCRIPT, SETTINGS_PATH, PURGE_LIST], {stdio: 'inherit'});
    child.on('close', (code) => process.exit(code));
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function filterItemsByLanguage(items, targetLanguages) {
    return items.map((item) => {
        const nameHub = {};
        for (const lang of targetLanguages) {
            nameHub[lang] = item.name[lang];
        }
        return {name: nameHub};
    });
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default purge;
