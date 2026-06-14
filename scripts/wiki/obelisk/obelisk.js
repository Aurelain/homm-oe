import {execSync} from 'node:child_process';
import unzipCore from '../../helpers/unzipCore.js';
import fs from 'fs';
import match from '../../utils/match.js';
import {WIKI_DIR} from '../SETTINGS.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const OBELISK_DIR = '/a/aims/obelisk';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function obelisk() {
    const tag = generateTag();
    // const tag = '2026-06-14_11-43-03';

    unzipCore(OBELISK_DIR + '/' + tag);
    runBotExtract(tag);
    copyFiles(OBELISK_DIR + '/obelisk-bot/out/' + tag + '/data');
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function generateTag() {
    let tag = new Date().toISOString();
    tag = tag.replace(/\..*/, '');
    tag = tag.replaceAll(':', '-');
    tag = tag.replaceAll('T', '_');
    return tag;
}

/**
 *
 */
function runBotExtract(tag) {
    try {
        const stdout = execSync(OBELISK_DIR + `/obelisk-bot/.venv/bin/obelisk extract ../${tag}`, {
            cwd: OBELISK_DIR + '/obelisk-bot',
            encoding: 'utf-8',
        });
        console.log(stdout);
    } catch (error) {
        console.error('Execution failed!');
        console.error('Status Code:', error.status);
        console.error('Stderr:', error.stderr);
    }
}

/**
 *
 */
function copyFiles(dirPath) {
    const dirList = fs.readdirSync(dirPath);
    for (const dirName of dirList) {
        const dirFullPath = dirPath + '/' + dirName;
        const wikiPrefix = getWikiPrefix(dirFullPath);
        const fileList = fs.readdirSync(dirFullPath);
        for (const fileName of fileList) {
            let destination;
            if (fileName.startsWith('_index')) {
                destination = WIKI_DIR + '/Data/' + wikiPrefix + '.wiki';
            } else {
                destination = WIKI_DIR + '/Data/' + wikiPrefix + '~' + fileName.replace('.txt', '');
            }
            if (!fs.existsSync(destination)) {
                console.log('Destination is missing:', destination);
            } else {
                const content = fs.readFileSync(dirFullPath + '/' + fileName, 'utf8');
                fs.writeFileSync(destination, content.replace(/\s*$/, ''));
            }
        }
    }
}

/**
 *
 */
function getWikiPrefix(dirPath) {
    const content = fs.readFileSync(dirPath + '/_index.wiki.txt', 'utf8');
    const [, prefix] = match(content, /\* \[\[Data:(\w+)/);
    return prefix;
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await obelisk();
