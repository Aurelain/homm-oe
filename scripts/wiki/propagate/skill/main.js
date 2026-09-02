import suggestFileNames from '../../helpers/suggestFileNames.js';
import generatePayloads from '../../helpers/generatePayloads.js';
import WORDS from '../../WORDS.js';
import unzipCore from '../../../helpers/unzipCore.js';
import prepare from './prepare.js';
import fs from 'fs';
import collect from './collect.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const TARGET_LANGUAGES = new Set([
    // 'pt_br',
    // 'cs',
    // 'en',
    // 'fr',
    // 'de',
    // 'hu',
    // 'it',
    // 'ja',
    // 'ko',
    // 'pl',
    // 'ru',
    // 'es',
    // 'tr',
    // 'uk',
    'zh-hans',
    // 'zh-hant',
]);

const IDS = new Set([
    // -- Note: if all items are disabled, all ids are allowed
    // 'skill_assault',
    // 'skill_protection',
]);

const SUFFIXES = {
    'Summon Avatar': {
        en: 'Skill',
        ['zh-hans']: '技能',
        es: 'Habilidad',
        fr: 'Compétence',
        pt_br: 'Habilidade',
        ru: 'навык',
        de: 'Fähigkeit',
        ja: 'スキル',
        tr: 'Beceri',
        ko: '스킬',
        it: 'Abilità',
        ['zh-hant']: '技能',
        pl: 'Umiejętność',
        uk: 'Вміння',
        hu: 'Képesség',
        cs: 'Schopnost',
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
    let skills = collect(zipHub);

    // Uncomment the following line to just purge the wiki pages:
    // return purge(skills, TARGET_LANGUAGES);

    const fileNames = suggestFileNames(skills, SUFFIXES);

    skills = IDS.size ? skills.filter((item) => IDS.has(item.id)) : skills;

    const payloads = generatePayloads({
        items: skills,
        fileNames,
        languages: TARGET_LANGUAGES,
        translations: WORDS,
        builder: prepare,
        context: {zipHub},
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
