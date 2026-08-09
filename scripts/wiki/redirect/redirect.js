import assume from '../../utils/assume.js';
import fs from 'node:fs';
import {WIKI_DIR} from '../SETTINGS.js';
import suggestFileNames from '../helpers/suggestFileNames.js';
import buildLoc from '../helpers/buildLoc.js';
import convertFileNameToWikiUrl from '../helpers/convertFileNameToWikiUrl.js';
import getTranslations from '../helpers/getTranslations.js';
import getUnits from '../propagate/unit/getUnits.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const TARGET_LANGUAGES = new Set([
    // 'en',
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
function redirect() {
    // const items = getSkills();
    const items = getUnits();
    const fileNames = suggestFileNames(items);
    for (const lang of TARGET_LANGUAGES) {
        for (const item of items) {
            redirectItem(item, lang, fileNames);
        }
    }
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 * Moves existing content from the robotic path to the natural path and leaves a redirect behind.
 */
function redirectItem(item, lang, fileNames) {
    const titleEn = item.name.en;
    const fileNameEn = fileNames[titleEn + '@en'];
    assume(fileNameEn, `Could not find a filename for ${titleEn}!`);

    const fileNameXRobotic = fileNameEn.replace('.wiki', '~' + lang + '.wiki');
    const pathXRobotic = WIKI_DIR + '/Main/' + fileNameXRobotic;
    if (!fs.existsSync(pathXRobotic)) {
        console.log(`The file "${fileNameXRobotic}" wasn't created!`);
        return;
    }

    const content = fs.readFileSync(pathXRobotic, 'utf8');
    if (content.includes('REDIRECT')) {
        console.log(`The file "${fileNameXRobotic}" already contains a redirect!`);
        return;
    }

    const titleX = item.name[lang];
    const fileNameX = fileNames[titleX + '@' + lang];
    if (fileNameX === fileNameXRobotic) {
        // This page has the same title as the English one, so the main page is actually the robotic page
        console.log(`The file "${fileNameXRobotic}" needs no redirect!`);
        return;
    }
    assume(fileNameX, titleX, `Could not find a filename for ${titleX}!`);

    // Move content
    const adaptedContent = adaptContent(content, lang, fileNameX, fileNameXRobotic);
    const pathX = WIKI_DIR + '/Main/' + fileNameX;
    fs.writeFileSync(pathX, adaptedContent);

    // Redirect
    const url = convertFileNameToWikiUrl(fileNameX);
    fs.writeFileSync(pathXRobotic, `#REDIRECT [[${url}]]`);
}

/**
 *
 */
function adaptContent(content, lang, fileNameX, fileNameXRobotic) {
    const loc = buildLoc({lang, fileNameX, fileNameXRobotic});
    content = content.replace(/\{\{Loc.*?}}/i, loc);
    return content;
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await redirect();
