import fs from 'node:fs';
import walk from '../../utils/walk.js';
import {WIKI_DIR} from '../SETTINGS.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function readFiles(namespace) {
    const names = walk(WIKI_DIR + '/' + namespace);
    names.sort();
    // const list = [];
    const hub = {};
    for (const name of names) {
        // list.push({name, content: fs.readFileSync(name, 'utf8')});
        hub[name] = fs.readFileSync(name, 'utf8');
    }
    // return list;
    return hub;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default readFiles;
