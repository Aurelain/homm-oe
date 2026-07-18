import fs from 'node:fs';
import suggestFileNames from '../helpers/suggestFileNames.js';
import handleFreshUnit from './handleFreshUnit.js';
import handleOldUnit from './handleOldUnit.js';
import generatePayloads from '../helpers/generatePayloads.js';
import fattenUnits from './fattenUnits.js';
import getUnits from './getUnits.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const TRANSLATIONS = {
    Category_Units: {
        pt_br: '',
        cs: '',
        en: 'Units',
        fr: '',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: '',
        ru: '',
        es: '',
        tr: '',
        uk: '',
        zh_hans: '',
        zh_hant: '',
    },
    Strategy: {
        pt_br: '',
        cs: '',
        en: 'Strategy',
        fr: 'Stratégie',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: 'Strategia',
        ru: 'Стратегия',
        es: '',
        tr: '',
        uk: '',
        zh_hans: '',
        zh_hant: '',
    },
    Strategy_text: {
        pt_br: '',
        cs: '',
        en: 'Nothing yet. Maybe you can add it...?',
        fr: '',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: 'Jeszcze nic. Może możesz to dodać...?',
        ru: 'Здесь пока ничего нет. Возможно, вы сможете это исправить?',
        es: '',
        tr: '',
        uk: '',
        zh_hans: '',
        zh_hant: '',
    },
    Specialist: {
        pt_br: '',
        cs: '',
        en: 'Specialist hero',
        fr: '',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: '',
        ru: '',
        es: '',
        tr: '',
        uk: '',
        zh_hans: '',
        zh_hant: '',
    },
};

const TARGET_LANGUAGES = new Set([
    'en',
    // 'zh_hans',
    // 'es',
    // 'fr',
    // 'pt_br',
    // 'ru',
    // 'de',
    // 'ja',
    // 'tr',
    // 'ko',
    // 'it',
    // 'zh_hant',
    // 'pl',
    // 'uk',
    // 'hu',
    // 'cs',
]);

const FACTIONS = new Set([
    'human',
    // 'undead',
    // 'nature',
    // 'demon',
    // 'unfrozen',
    // 'dungeon',
    // 'neutral',
]);

const IDS = ['angel'];

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function unit() {
    let units = getUnits();
    const fileNames = suggestFileNames(units);

    // units = units.filter((item) => IDS.includes(item.target_id));
    units = fattenUnits(units);
    units = units.filter((item) => FACTIONS.has(item.faction));

    const payloads = generatePayloads({
        items: units,
        fileNames,
        languages: TARGET_LANGUAGES,
        translations: TRANSLATIONS,
        handleFresh: handleFreshUnit,
        handleOld: handleOldUnit,
    });
    // console.log('payloads:', payloads);

    for (const {path, content} of payloads) {
        content && fs.writeFileSync(path, content);
    }
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await unit();
