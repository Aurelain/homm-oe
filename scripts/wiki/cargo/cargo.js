import unzipCore from '../../helpers/unzipCore.js';
import unit from './unit.js';
import {WIKI_DIR} from '../SETTINGS.js';
import {buildCache} from './translate.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const parsers = [unit];
// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function cargo() {
    const zipHub = unzipCore();
    buildCache(zipHub);

    const definitions = {};
    parsers.forEach((parser) => Object.assign(definitions, parser(zipHub)));

    console.log('definitions:', JSON.stringify(definitions, null, 4));
    for (const key in definitions) {
        const path = WIKI_DIR + '/' + key + '.wiki';
        // fs.writeFileSync(path, definitions[key]);
    }
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
cargo();
