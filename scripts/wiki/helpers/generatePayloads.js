import fs from 'node:fs';
import {WIKI_DIR} from '../SETTINGS.js';
import convertFileNameToWikiUrl from './convertFileNameToWikiUrl.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function generatePayloads({items, fileNames, languages, translations, builder, context}) {
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
                // name: titleX,
                id: item['target_id'],
                fileNameX,
                fileNameXRobotic,
            };
            const content = fs.existsSync(pathX) ? fs.readFileSync(pathX, 'utf8') : '';
            payloads.push({
                path: pathX,
                content: builder(info, translations, context, content),
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
//  E X P O R T
// =====================================================================================================================
export default generatePayloads;
