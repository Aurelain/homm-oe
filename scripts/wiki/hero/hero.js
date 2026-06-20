import fs from 'node:fs';
import {WIKI_DIR} from '../SETTINGS.js';
import suggestFileNames from '../helpers/suggestFileNames.js';
import convertFileNameToWikiUrl from '../helpers/convertFileNameToWikiUrl.js';
import getHeroes from './getHeroes.js';
import enumerate from '../../utils/enumerate.js';
import createFreshHero from './createFreshHero.js';
import updateExistingHero from './updateExistingHero.js';

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
    const heroes = getHeroes();
    enumerate(heroes);
    const fileNames = suggestFileNames(heroes);
    const payloads = generatePayloads(heroes, fileNames);
    console.log('payloads:', payloads);
    // for (const {path, content} of payloads) {
    //     fs.writeFileSync(path, content);
    // }
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function generatePayloads(heroes, fileNames) {
    const payloads = [];
    for (const hero of heroes) {
        for (const lang of TARGET_LANGUAGES) {
            const titleX = hero.name[lang];
            const fileNameX = fileNames[titleX + '@' + lang];

            const pathX = WIKI_DIR + '/Main/' + fileNameX;
            const fileNameXRobotic = fileNames[hero.name.en + '@en'].replace('.wiki', '~' + lang + '.wiki');
            const info = {
                lang,
                name: titleX,
                heroId: hero.target_id,
                fileNameX,
                fileNameXRobotic,
            };
            payloads.push({
                path: pathX,
                content: fs.existsSync(pathX) ? overwrite(pathX, info) : createFreshHero(info, TRANSLATIONS),
            });
            if (lang !== 'en') {
                const url = convertFileNameToWikiUrl(fileNameX);
                payloads.push({
                    path: WIKI_DIR + '/Main/' + fileNameXRobotic,
                    content: `#REDIRECT [[${url}]]`,
                });
            }
        }
    }
    return payloads;
}

/**
 *
 */
function overwrite(path, info) {
    const content = fs.readFileSync(path, 'utf8');
    return updateExistingHero(info, TRANSLATIONS, content);
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await hero();
