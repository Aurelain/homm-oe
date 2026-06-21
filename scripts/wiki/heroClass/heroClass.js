import suggestFileNames from '../helpers/suggestFileNames.js';
import handleFreshHeroClass from './handleFreshHeroClass.js';
import handleOldHeroClass from './handleOldHeroClass.js';
import generatePayloads from '../helpers/generatePayloads.js';
import getTranslations from '../helpers/getTranslations.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const TRANSLATIONS = {
    category_HeroClasses: {
        pt_br: '',
        cs: '',
        en: 'Hero Classes',
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

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function heroClass() {
    const classes = getTranslations('/HeroClass~', 'hero_class');
    const fileNames = suggestFileNames(classes);
    const payloads = generatePayloads({
        items: classes,
        fileNames,
        languages: TARGET_LANGUAGES,
        translations: TRANSLATIONS,
        handleFresh: handleFreshHeroClass,
        handleOld: handleOldHeroClass,
    });
    for (const {path, content} of payloads) {
        // fs.writeFileSync(path, content);
    }
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await heroClass();
