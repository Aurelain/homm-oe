import {buildCache} from '/a/aims/oe-wiki/src/parse/helpers/translate.js';
import assume from '../../utils/assume.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function collectMain(zipHub, cargoGenerator) {
    const list = [];

    buildCache(zipHub);
    const cargoFiles = cargoGenerator(zipHub);
    for (const path in cargoFiles) {
        if (path.includes('_orphan_sub_skills')) {
            continue;
        }
        const defs = cargoFiles[path];
        const mainDef = defs.shift();
        assume(mainDef?._type === cargoGenerator.name + 'Def', path, 'Unexpected main def!');
        if (mainDef.unused) {
            continue;
        }
        const name = {};
        const description = {};
        for (const def of defs) {
            if (def._type === 'TranslationDef' && def.target_id === mainDef.id) {
                name[def.language] = def.name;
                description[def.language] = def.description;
            }
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
export default collectMain;
