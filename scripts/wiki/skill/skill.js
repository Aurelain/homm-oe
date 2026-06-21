import {WIKI_DIR} from '../SETTINGS.js';
import assume from '../../utils/assume.js';
import fs from 'fs';
import createFreshSkill from './createFreshSkill.js';
import updateExistingSkill from './updateExistingSkill.js';
import getSkills from './getSkills.js';
import suggestFileNames from '../helpers/suggestFileNames.js';
import convertFileNameToWikiUrl from '../helpers/convertFileNameToWikiUrl.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const TRANSLATIONS = {
    // `tutorial_M_13_name_1` in `tutorial.json`
    heroSkills: {
        pt_br: 'Habilidades de Herói',
        cs: 'Schopnosti hrdiny',
        en: 'Hero Skills',
        fr: 'Compétences de héros',
        de: 'Heldenfähigkeiten',
        hu: 'A hősök képességei',
        it: "Abilità dell'eroe",
        ja: 'ヒーローのスキル',
        ko: '영웅 스킬',
        pl: 'Umiejętności bohatera',
        ru: 'Навыки героев',
        es: 'Habilidades del héroe',
        tr: 'Kahraman Becerileri',
        uk: 'Уміння героя',
        zh_cn: '英雄技能',
        zh_tw: '英雄技能',
    },
    // We could take these from `tutorial_M_13_name`, but it's a delicate operation:
    levels: {
        pt_br: '',
        cs: '',
        en: 'Levels',
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
    synergies: {
        pt_br: '',
        cs: '',
        en: 'Skill Synergies',
        fr: 'Synergies de compétences',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: 'Synergia',
        ru: 'Синергия навыков',
        es: '',
        tr: '',
        uk: '',
        zh_cn: '',
        zh_tw: '',
    },
    synergiesText: {
        pt_br: '',
        cs: '',
        en: 'Knowing # will give the following benefits to other subskills:',
        fr: 'Connaître la # apporte les avantages suivants aux autres compétences secondaires :',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: 'Znajomość umiejętności # zapewni następujące korzyści innym podumiejętnościom:',
        ru: 'Владение навыком «#» даёт следующие преимущества для других поднавыков:',
        es: '',
        tr: '',
        uk: '',
        zh_cn: '',
        zh_tw: '',
    },
    artifacts: {
        pt_br: '',
        cs: '',
        en: 'Artifact Effects',
        fr: "Effets d'artéfact",
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: '',
        ru: 'Эффекты артефактов',
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
    'fr',
    // 'pt_br',
    'ru',
    // 'de',
    // 'ja',
    // 'tr',
    // 'ko',
    // 'it',
    // 'zh_tw',
    'pl',
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
async function skill() {
    const skills = getSkills();
    const fileNames = suggestFileNames(skills);
    const payloads = generatePayloads(skills, fileNames);
    for (const {path, content} of payloads) {
        fs.writeFileSync(path, content);
    }
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function generatePayloads(skills, fileNames) {
    const payloads = [];
    for (const skill of skills) {
        for (const lang of TARGET_LANGUAGES) {
            const titleX = skill.name[lang];
            // if (titleX !== 'Adresse') continue;
            const fileNameX = fileNames[titleX + '@' + lang];
            assume(fileNameX, titleX, 'Cannot resolve path!');

            const pathX = WIKI_DIR + '/Main/' + fileNameX;
            const fileNameXRobotic = fileNames[skill.name.en + '@en'].replace('.wiki', '~' + lang + '.wiki');
            const info = {
                lang,
                name: titleX,
                skillId: skill.target_id,
                fileNameX,
                fileNameXRobotic,
            };
            payloads.push({
                path: pathX,
                content: fs.existsSync(pathX) ? overwrite(pathX, info) : createFreshSkill(info, TRANSLATIONS),
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
    return updateExistingSkill(info, TRANSLATIONS, content);
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await skill();
