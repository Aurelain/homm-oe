import add from './add.js';
import filterHub from '../../helpers/filterHub.js';
import assume from '../../utils/assume.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
let cache;
const LANGUAGES = {
    en: 'english',
    pt_br: 'BRportugese',
    cs: 'czech',
    fr: 'french',
    de: 'german',
    hu: 'hungarian',
    it: 'italian',
    ja: 'japanese',
    ko: 'korean',
    pl: 'polish',
    ru: 'russian',
    es: 'spanish',
    tr: 'turkish',
    uk: 'ukrainian',
    'zh-hans': 'zhCN',
    'zh-hant': 'zhTW',
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function translate(list) {
    if (!cache) {
        console.log('Please first build the cache!');
        return;
    }

    const defs = [];

    for (const item of list) {
        for (const lang in LANGUAGES) {
            const langMap = cache[lang];
            const def = {_type: 'TranslationDef'};
            add(def, 'target_id', item.target_id);
            add(def, 'type', item.type);
            add(def, 'subtype', item.subtype);
            add(def, 'variant', item.variant);
            add(def, 'language', lang);
            add(def, 'name', langMap.get(item.name));
            add(def, 'description', langMap.get(item.description));
            add(def, 'bonus_description', langMap.get(item.bonus_description));
            assume(!('name' in item) || langMap.has(item.name), item.name, 'Missing name id!');
            assume(!('description' in item) || langMap.has(item.description), item, 'Missing desc id!');
            assume(!('bonus_description' in item) || langMap.has(item.bonus_description), item, 'Missing bonus id!');
            defs.push(def);
        }
    }

    return defs;
}

/**
 *
 */
function buildCache(zipHub) {
    cache = {};
    for (const key in LANGUAGES) {
        const langHub = filterHub(zipHub, new RegExp('Lang/' + LANGUAGES[key] + '/'));
        const langMap = new Map();
        for (const path in langHub) {
            const tokens = langHub[path];
            for (const token of tokens) {
                assume(Object.keys(token).toString() === 'sid,text', token, 'Unexpected token structure!');
                langMap.set(token.sid, token.text);
            }
        }
        cache[key] = langMap;
    }
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default translate;
export {buildCache};
