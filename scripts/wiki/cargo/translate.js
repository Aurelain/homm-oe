import add from './add.js';
import filterHub from '../../helpers/filterHub.js';
import assume from '../../utils/assume.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
let cache;
let args;
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
    // 'zh-hans': 'zhCN',
    zh_cn: 'zhCN',
    // 'zh-hant': 'zhTW',
    zh_tw: 'zhTW',
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function translate(translationRequests) {
    if (!cache) {
        console.log('Please first build the cache!');
        return;
    }

    const defs = [];

    for (const request of translationRequests) {
        for (const lang in LANGUAGES) {
            const langMap = cache[lang];
            const def = {_type: 'TranslationDef'};
            add(def, 'target_id', request.target_id);
            add(def, 'type', request.type);
            add(def, 'subtype', request.subtype);
            add(def, 'variant', request.variant);
            add(def, 'language', lang);
            add(def, 'name', adaptTranslation(request, 'name', langMap));
            add(def, 'description', adaptTranslation(request, 'description', langMap));
            add(def, 'bonus_description', adaptTranslation(request, 'bonus_description', langMap));
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
    buildArgs(zipHub);
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function buildArgs(zipHub) {
    const argsHub = filterHub(zipHub, new RegExp('Lang/args/'));
    args = new Map();
    for (const path in argsHub) {
        const tokens = argsHub[path];
        for (const token of tokens) {
            assume(Object.keys(token).toString() === 'sid,args', token, 'Unexpected args item structure!');
            args.set(token.sid, token.args);
        }
    }
}

/**
 *
 */
function resolveArg(textId, nr, langMap, request) {
    const argsList = args.get(textId);
    assume(argsList, request, textId, 'No args found!');
    const island = argsList[nr];
    return island;
}

/**
 *
 */
function adaptTranslation(request, prop, langMap) {
    if (!(prop in request)) {
        return;
    }
    const textId = request[prop];
    assume(langMap.has(textId), request, `Cannot find "${prop}" in translation cache!`);
    let text = langMap.get(textId);
    if (text.includes('{')) {
        text = text.replace(/\{(\d)}/g, (all, nr) => {
            return resolveArg(textId, nr, langMap);
        });
        assume(!text.includes('{'), request, text, 'Still has braces!');
    }
    return text;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default translate;
export {buildCache};
