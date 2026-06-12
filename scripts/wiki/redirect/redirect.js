import getSkills from './getSkills.js';
import assume from '../../utils/assume.js';
import fs from 'node:fs';
import {WIKI_DIR} from '../SETTINGS.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const TARGET_LANGUAGES = new Set([
    // 'en',
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
    'pl',
    // 'uk',
    // 'hu',
    // 'cs',
]);
const PATCH_NAMES = {
    'Summon Avatar': 'Summon Avatar (Skill)',
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function redirect() {
    const items = getSkills();
    for (const lang of TARGET_LANGUAGES) {
        for (const item of items) {
            redirectItem(item, lang);
        }
    }
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function redirectItem(item, lang) {
    const titleEn = PATCH_NAMES[item.name.en] || item.name.en;
    const fileNameEn = titleEn.replaceAll(' ', '_');
    assume(fileNameEn, 'File name in English is invalid!');
    const roboticX = fileNameEn + '~' + lang;
    const roboticPathX = WIKI_DIR + '/Main/' + roboticX + '.wiki';
    if (!fs.existsSync(roboticPathX)) {
        return;
    }
    const content = fs.readFileSync(roboticPathX, 'utf8');
    // const naturalPath = WIKI_DIR + '/Main/' + roboticX + '.wiki';
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await redirect();
