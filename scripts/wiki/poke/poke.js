import walk from '../../utils/walk.js';
import {WIKI_DIR} from '../SETTINGS.js';
import filter from '../../utils/filter.js';
import fs from 'node:fs';
import convertFileNameToWikiUrl from '../helpers/convertFileNameToWikiUrl.js';
import {join} from 'node:path';
import {spawn} from 'node:child_process';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const EXTERNAL_SCRIPT = join(import.meta.dirname, '../../../../mirror-wiki/scripts/poke/poke.js');
const SETTINGS_PATH = join(import.meta.dirname, '../../../../oe-wiki/WIKI.json');
const POKE_LIST = join(import.meta.dirname, '/poke.json');

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function poke() {
    const titles = getTitles('Data', '/MapObject~');

    // Call `poke` from `mirror-wiki`:
    fs.writeFileSync(POKE_LIST, JSON.stringify(titles, null, 4));
    const child = spawn('node', [EXTERNAL_SCRIPT, SETTINGS_PATH, POKE_LIST], {stdio: 'inherit'});
    child.on('close', (code) => process.exit(code));
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function getTitles(dir, filePattern, contentPattern) {
    let paths = walk(WIKI_DIR + '/' + dir);
    paths = filter(paths, filePattern);
    const output = [];
    for (const path of paths) {
        const content = fs.readFileSync(path, 'utf8');
        if (!contentPattern || content.includes(contentPattern)) {
            const short = path.substring(WIKI_DIR.length + 1);
            let title = convertFileNameToWikiUrl(short);
            if (dir === 'Main') {
                title = title.substring('Main'.length);
            } else {
                title = title.replace('/', ':');
            }
            output.push(title);
        }
    }
    return output;
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await poke();
