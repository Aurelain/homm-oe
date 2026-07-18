import filter from '../../utils/filter.js';
import {LANG_COUNT, WIKI_DIR} from '../SETTINGS.js';
import walk from '../../utils/walk.js';
import parseTranslationFile from '../helpers/parseTranslationFile.js';
import assume from '../../utils/assume.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 * [
 *     {
 *         target_id: 'unfrozen_hero_9',
 *         name: {
 *             en: 'Martyr Tho',
 *             ...,
 *         },
 *         description: {
 *             en: 'The schismatics experimented ...',
 *             ...,
 *         },
 *     }
 * ]
 */
function getTranslations(filePattern, type, fileBlacklist = null) {
    const dataPaths = walk(WIKI_DIR + '/Data');
    let paths = filter(dataPaths, filePattern);
    if (fileBlacklist) {
        paths = filter(paths, (path) => !path.match(fileBlacklist));
    }
    const items = [];
    for (const path of paths) {
        const definitions = parseTranslationFile(path);
        if (!definitions) {
            continue;
        }
        const targetDefinitions = definitions.filter((item) => item.type === type);
        assume(targetDefinitions.length === 1, path, 'Expecting only one result from a file!');
        const definition = targetDefinitions[0];
        const names = Object.values(definition.name);
        assume(names.length === LANG_COUNT, names, 'Unexpected languages count!');
        items.push({
            path,
            ...definition,
        });
    }
    return items;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default getTranslations;
