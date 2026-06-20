import filter from '../../utils/filter.js';
import {LANG_COUNT, WIKI_DIR} from '../SETTINGS.js';
import walk from '../../utils/walk.js';
import parseTranslationFile from '../helpers/parseTranslationFile.js';
import assume from '../../utils/assume.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 * Returns the array of all heroes:
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
function getHeroes() {
    const dataPaths = walk(WIKI_DIR + '/Data');
    const heroPaths = filter(dataPaths, '/Hero~');
    const skirmishHeroPaths = filter(heroPaths, (item) => !item.match(/tutorial|campaign|cm_fun/));
    const heroes = [];
    for (const path of skirmishHeroPaths) {
        const definitions = parseTranslationFile(path);
        const heroDefinitions = definitions.filter((item) => item.type === 'hero');
        assume(heroDefinitions.length === 1, 'Expecting only one hero from a file!');
        const heroDefinition = heroDefinitions[0];
        const names = Object.values(heroDefinition.name);
        assume(names.length === LANG_COUNT, names, 'Unexpected languages count!');
        heroes.push(heroDefinition);
    }
    return heroes;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default getHeroes;
