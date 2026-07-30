import add from './add.js';
import filterHub from '../../helpers/filterHub.js';
import assume from '../../utils/assume.js';
import compile from './compile.js';
import evaluate from './evaluate.js';
import objectify from '../../utils/objectify.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
let words;
let args;
let scripts;
let buffs;
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
    if (!words) {
        console.log('Please first build the cache!');
        return;
    }

    const defs = [];

    for (const request of translationRequests) {
        const data = generateData(request);
        for (const lang in LANGUAGES) {
            const langMap = words[lang];
            const def = {_type: 'TranslationDef'};
            add(def, 'target_id', request.target_id);
            add(def, 'type', request.type);
            add(def, 'subtype', request.subtype);
            add(def, 'variant', request.variant);
            add(def, 'language', lang);
            add(def, 'name', adaptTranslation(request, 'name', langMap, data));
            add(def, 'description', adaptTranslation(request, 'description', langMap, data));
            add(def, 'bonus_description', adaptTranslation(request, 'bonus_description', langMap, data));
            // if (def.name || def.description || def.bonus_description) {
            defs.push(def);
        }
    }

    return defs;
}

/**
 *
 */
function buildCache(zipHub) {
    words = {};
    for (const key in LANGUAGES) {
        const langHub = filterHub(zipHub, new RegExp('Lang/' + LANGUAGES[key] + '/'));
        const langMap = new Map();
        for (const path in langHub) {
            const tokens = langHub[path];
            for (const token of tokens) {
                assume(Object.keys(token).toString() === 'sid,text', token, 'Unexpected token structure!');
                const text = normalizeText(token.text);
                langMap.set(token.sid, text);
            }
        }
        words[key] = langMap;
    }
    buildArgs(zipHub);
    buildScripts(zipHub);
    buildBuffs(zipHub);
}

/**
 *
 */
function checkExists(id) {
    return words.en.has(id);
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
function buildScripts(zipHub) {
    const scriptsHub = filterHub(zipHub, new RegExp('DB/info/.*script$'));
    const allScripts = Object.values(scriptsHub).join('\n/**/\n');
    scripts = compile(allScripts);
    // fs.writeFileSync('allScripts.json', JSON.stringify(scripts, null, 4));
}

/**
 *
 */
function buildBuffs(zipHub) {
    const buffsHub = filterHub(zipHub, 'DB/buffs');
    const list = Object.values(buffsHub).flat();
    buffs = objectify(list, 'id');
}

/**
 *
 */
function generateData(request) {
    return {
        currentUnitData: {
            fullStacks: 0,
            tempFullStacks: 0,
            startBattleFullStacks: 0,
            unit: {
                stats: {
                    finalSummonBonusPercent: 0,
                },
            },
        },
        buffs,
        ...request._data,
    };
}

/**
 *
 */
function resolveArg(textId, nr, langMap, request, data) {
    const argsList = args.get(textId);
    assume(argsList, request, textId, 'No args found!');
    const island = argsList[nr];
    const [main, redirect] = island.split('|');
    assume(!redirect || langMap.get(redirect), textId, redirect, 'Redirect not found!');
    let text = redirect ? langMap.get(redirect) : '{0}';
    const evaluated = evaluate(main, scripts, data);
    text = text.replace('{0}', evaluated);
    return text;
}

/**
 *
 */
function adaptTranslation(request, prop, langMap, data) {
    if (!(prop in request)) {
        return;
    }
    const textId = request[prop];
    if (!langMap.has(textId)) {
        console.log(`Cannot find "${textId}" in translation cache!`);
        return;
    }
    let text = langMap.get(textId);
    if (text.includes('{')) {
        text = text.replace(/\{(\d)}/g, (all, nr) => {
            return resolveArg(textId, nr, langMap, request, data);
        });
        assume(!text.includes('{'), request, text, 'Still has braces!');
    }
    return text;
}

/**
 *
 */
function normalizeText(text) {
    text = text.replace(/\n/g, '<br/>');
    text = text.replace(/ /g, ' '); // TODO: remove this
    text = text.replace(/‑/g, '-'); // TODO: remove this
    return text;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default translate;
export {buildCache, checkExists};
