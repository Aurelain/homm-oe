import suggestFileNames from '../helpers/suggestFileNames.js';
import getTranslations from '../helpers/getTranslations.js';
import convertFileNameToWikiUrl from '../helpers/convertFileNameToWikiUrl.js';
import {WIKI_DIR} from '../SETTINGS.js';
import fs from 'node:fs';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function preparePurge() {
    const items = getTranslations('/Hero~', 'hero', /tutorial|campaign|cm_fun/);
    const fileNames = suggestFileNames(items);
    const list = [];
    for (const key in fileNames) {
        const value = fileNames[key];
        if (fs.existsSync(WIKI_DIR + '/Main/' + value)) {
            const title = convertFileNameToWikiUrl(fileNames[key]);
            list.push(title);
        }
    }
    fs.writeFileSync(WIKI_DIR + '/../scripts/purge/purge.json', JSON.stringify(list, null, 4));
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await preparePurge();
