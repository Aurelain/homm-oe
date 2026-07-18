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
        zh_cn: '',
        zh_tw: '',
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
        zh_cn: '',
        zh_tw: '',
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
        zh_cn: '',
        zh_tw: '',
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
        zh_cn: '',
        zh_tw: '',
    },
};

const TARGET_LANGUAGES = new Set([
    'en',
    // 'zh_cn',
    // 'es',
    // 'fr',
    // 'pt_br',
    // 'ru',
    // 'de',
    // 'ja',
    // 'tr',
    // 'ko',
    // 'it',
    // 'zh_tw',
    // 'pl',
    // 'uk',
    // 'hu',
    // 'cs',
]);

const IDS = [];

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function unit() {
    let units = getUnits();
    const fileNames = suggestFileNames(units);

    // spells = spells.filter((item) => IDS.includes(item.target_id));

    const fatUnits = fattenUnits(units);
    console.log('fatUnits:', fatUnits);
    return;

    const payloads = generatePayloads({
        items: fatUnits,
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
