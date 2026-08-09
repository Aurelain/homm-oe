import suggestFileNames from '../../helpers/suggestFileNames.js';
import generatePayloads from '../../helpers/generatePayloads.js';
import WORDS from '../../WORDS.js';
import getTranslations from '../../helpers/getTranslations.js';
import unzipCore from '../../../helpers/unzipCore.js';
import prepare from './prepare.js';
import fs from 'fs';
import collect from './collect.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const TARGET_LANGUAGES = new Set([
    'en',
    // 'zh-hans',
    // 'es',
    // 'fr',
    // 'pt_br',
    // 'ru',
    // 'de',
    // 'ja',
    // 'tr',
    // 'ko',
    // 'it',
    // 'zh-hant',
    // 'pl',
    // 'uk',
    // 'hu',
    // 'cs',
]);

const FACTIONS = new Set([
    // -- Note: if all items are disabled, all factions are allowed
    // 'human',
    // 'undead',
    // 'nature',
    // 'demon',
    // 'unfrozen',
    // 'dungeon',
    // 'neutral',
]);

const IDS = new Set([
    // -- Note: if all items are disabled, all ids are allowed
    // 'esquire',
    // 'angel',
    // 'frostworm_rider',
    // 'frostworm_rider_upg',
    // 'assassin',
    // 'assassin_upg_alt',
    // 'lava_larva',
    // 'frostworm_rider',
    // 'frostworm_rider_upg',
    // 'frostworm_rider_upg_alt',
    // 'unicorn',
    // 'lava_larva',
    // 'dragon',
]);

const SWITCHEROOS = {
    Stinger: {
        en: 'unit',
        fr: 'unité',
        ja: 'unit',
        pl: 'jednostka',
    },
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function main() {
    const zipHub = unzipCore();
    let units = collect(zipHub);

    // Uncomment the following line to just purge the wiki pages:
    // return purge(units, TARGET_LANGUAGES, SWITCHEROOS);

    const fileNames = suggestFileNames(units, SWITCHEROOS);

    units = IDS.size ? units.filter((item) => IDS.has(item.id)) : units;
    units = FACTIONS.size ? units.filter((item) => FACTIONS.has(item.faction)) : units;

    const laws = getTranslations('/Law~', {type: 'law_level', variant: '1'}, '~test_');

    const payloads = generatePayloads({
        items: units,
        fileNames,
        languages: TARGET_LANGUAGES,
        translations: WORDS,
        builder: prepare,
        context: {laws, units, zipHub},
    });

    for (const {path, content} of payloads) {
        // console.log('========\n' + path + '\n' + content);
        content && fs.writeFileSync(path, content);
    }
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await main();
