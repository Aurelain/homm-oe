import fs from 'node:fs';
import suggestFileNames from '../helpers/suggestFileNames.js';
import handleFreshHero from './handleFreshHero.js';
import handleOldHero from './handleOldHero.js';
import getTranslations from '../helpers/getTranslations.js';
import generatePayloads from '../helpers/generatePayloads.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const TRANSLATIONS = {
    category_Heroes: {
        pt_br: 'Heróis',
        cs: 'Hrdinové',
        en: 'Heroes',
        fr: 'Héros',
        de: 'Helden',
        hu: 'Hősök',
        it: 'Eroi',
        ja: 'ヒーロー',
        ko: '영웅',
        pl: 'Bohaterowie',
        ru: 'Герои',
        es: 'Héroes',
        tr: 'Kahramanlar',
        uk: 'Герої',
        zh_cn: '英雄',
        zh_tw: '英雄',
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

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function hero() {
    const skirmishHeroes = getTranslations('/Hero~', 'hero', /tutorial|campaign|cm_fun/);
    const fileNames = suggestFileNames(skirmishHeroes);
    const payloads = generatePayloads({
        items: skirmishHeroes,
        fileNames,
        languages: TARGET_LANGUAGES,
        translations: TRANSLATIONS,
        handleFresh: handleFreshHero,
        handleOld: handleOldHero,
    });
    for (const {path, content} of payloads) {
        fs.writeFileSync(path, content);
    }
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await hero();
