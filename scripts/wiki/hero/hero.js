import {WIKI_DIR} from '../SETTINGS.js';
import assume from '../../utils/assume.js';
import fs from 'fs';
import getSkills from '../helpers/getSkills.js';
import suggestFileNames from '../helpers/suggestFileNames.js';
import convertFileNameToWikiUrl from '../helpers/convertFileNameToWikiUrl.js';
import getHeroes from './getHeroes.js';
import enumerate from '../../utils/enumerate.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const TRANSLATIONS = {};

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
    // const fileNames = suggestFileNames(skills);
    // const payloads = generatePayloads(skills, fileNames);
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
await hero();
