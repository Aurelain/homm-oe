import fs from 'node:fs';
import {WIKI_DIR} from '../SETTINGS.js';
import convertFileNameToWikiUrl from './convertFileNameToWikiUrl.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function generatePayloads({items, fileNames, languages, translations, handleFresh, handleOld}) {
    const payloads = [];
    for (const item of items) {
        for (const lang of languages) {
            const titleX = item.name[lang];
            const fileNameX = fileNames[titleX + '@' + lang];

            const pathX = WIKI_DIR + '/Main/' + fileNameX;
            const fileNameXRobotic = fileNames[item.name.en + '@en'].replace('.wiki', '~' + lang + '.wiki');
            const info = {
                ...item,
                lang,
                name: titleX,
                id: item['target_id'],
                fileNameX,
                fileNameXRobotic,
            };
            payloads.push({
                path: pathX,
                content: fs.existsSync(pathX)
                    ? overwrite(handleOld, pathX, info, translations)
                    : handleFresh(info, translations),
            });
            if (lang !== 'en' && fileNameX !== fileNameXRobotic) {
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

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function overwrite(handleOld, path, info, translations) {
    const content = fs.readFileSync(path, 'utf8');
    return handleOld(info, translations, content);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default generatePayloads;
