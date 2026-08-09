import HeroClass from '../../cargo/HeroClass.js';
import {buildCache} from '../../cargo/helpers/translate.js';
import assume from '../../../utils/assume.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function collect(zipHub) {
    const list = [];

    buildCache(zipHub);
    const cargoFiles = HeroClass(zipHub);
    for (const path in cargoFiles) {
        const defs = cargoFiles[path];
        const mainDef = defs.shift();
        assume(mainDef?._type === 'HeroClassDef', path, 'Unexpected main def!');
        const name = {};
        const description = {};
        for (const def of defs) {
            assume(def._type === 'TranslationDef', path, 'Unexpected def, must be translation!');
            name[def.language] = def.name;
            description[def.language] = def.description;
        }
        list.push({
            ...mainDef,
            name,
            description,
        });
    }

    return list;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default collect;
