import fs from 'node:fs';
import suggestFileNames from '../helpers/suggestFileNames.js';
import handleFreshUnit from './handleFreshUnit.js';
import handleOldUnit from './handleOldUnit.js';
import generatePayloads from '../helpers/generatePayloads.js';
import fattenUnits from './fattenUnits.js';
import getUnits from './getUnits.js';
import WORDS from './WORDS.js';
import purge from '../helpers/purge.js';
import getTranslations from '../helpers/getTranslations.js';
import unzipCore from '../../helpers/unzipCore.js';

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
    'human',
    // 'undead',
    // 'nature',
    // 'demon',
    // 'unfrozen',
    // 'dungeon',
    // 'neutral',
]);

const IDS = [
    // -- Note: if all items are disabled, all ids are allowed
    // 'esquire',
    // 'angel'
    // 'frostworm_rider',
    // 'frostworm_rider_upg',
    // 'assassin',
    // 'assassin_upg_alt',
    // 'lava_larva',
];

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
async function unit() {
    let units = getUnits();

    // Uncomment the following line to just purge the wiki pages:
    // return purge(units, TARGET_LANGUAGES, SWITCHEROOS);

    const fileNames = suggestFileNames(units, SWITCHEROOS);

    units = IDS.size ? units.filter((item) => IDS.has(item.target_id)) : units;
    units = fattenUnits(units);
    units = FACTIONS.size ? units.filter((item) => FACTIONS.has(item.faction)) : units;

    const laws = getTranslations('/Law~', {type: 'law_level', variant: '1'}, '~test_');
    const zipHub = unzipCore();

    const payloads = generatePayloads({
        items: units,
        fileNames,
        languages: TARGET_LANGUAGES,
        translations: WORDS,
        handleFresh: handleFreshUnit,
        handleOld: handleOldUnit,
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
await unit();
