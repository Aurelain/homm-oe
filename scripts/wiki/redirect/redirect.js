import getSkills from './getSkills.js';
import assume from '../../utils/assume.js';
import fs from 'node:fs';
import {WIKI_DIR} from '../SETTINGS.js';
import suggestFileNames from '../helpers/suggestFileNames.js';

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

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function redirect() {
    const items = getSkills();
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
    assume(fileNameX, titleX, `Could not find a filename for ${titleX}!`);

    // Move content
    const adaptedContent = adaptContent(content, fileNameX, fileNameXRobotic);
    const pathX = WIKI_DIR + '/Main/' + fileNameX;
    fs.writeFileSync(pathX, adaptedContent);

    // Redirect
    const url = convertFileNameToWikiUrl(fileNameX);
    fs.writeFileSync(pathXRobotic, `#REDIRECT [[${url}]]`);
}

/**
 *
 */
function adaptContent(content, fileNameX, fileNameXRobotic) {
    let title = fileNameX;
    title = title.replace('.wiki', '');
    for (const lang of TARGET_LANGUAGES) {
        title = title.replace(`(${lang})`, ''); // remove the language parenthesis, if any
    }
    title = title.replaceAll('_', ' ');

    const url = convertFileNameToWikiUrl(fileNameXRobotic);

    const loc = `{{Loc|${title}|link=${url}}}`;
    content = content.replace(/\{\{Loc.*?}}/i, loc);
    return content;
}

/**
 *
 */
function convertFileNameToWikiUrl(fileNameX) {
    let url = fileNameX;
    url = url.replace('.wiki', '');
    url = url.replace('~', '/');
    url = url.replaceAll('_', ' ');
    return url;
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await redirect();
