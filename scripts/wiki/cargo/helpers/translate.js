import add from './add.js';
import filterHub from '../../../helpers/filterHub.js';
import assume from '../../../utils/assume.js';
import compile from './compile.js';
import evaluate from './evaluate.js';
import objectify from '../../../utils/objectify.js';
import mergeDeep from '../../../utils/mergeDeep.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const DEBUG = new Set([
    // -- Uncomment any target_id you want to focus on:
    // 'black_dragon_upg_alt_3',
    // 'hive_queen_upg_3',
    // 'lava_larva_1',
    // 'inquisitor_upg_alt_2',
    // 'druid_upg_3',
    // 'frostworm_rider_upg_alt_1',
    // 'gorilla_2',
    // 'demon_passive_2',
]);

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

const DEFAULT_DATA = {
    currentUnitData: {
        fullStacks: 0,
        tempFullStacks: 0,
        startBattleFullStacks: 0,
        unit: {
            stats: {
                finalSummonBonusPercent: 0,
                outComingBuffDuration: 0,
                finalAbilityDamageBonusPercent: 0,
            },
        },
    },
    currentUnitConfig: {
        passives: [
            {
                actions: [
                    {
                        damageDealer: {
                            minStackDmg: 0,
                            maxStackDmg: 0,
                        },
                    },
                ],
            },
        ],
    },
    currentAbility: {
        damageDealer: {
            statDmgMult: 1,
            buff: {
                durationPerStack: [0, 0],
            },
        },
    },
    currentHero: {
        level: 1,
    },
};

let words;
let args;
let scripts;
let buffs;

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

            if (!langMap.has(request.name)) {
                continue;
            }

            const name = adaptTranslation(request.name, request, langMap, data);
            add(def, 'name', normalizeName(name, lang));
            add(def, 'description', adaptTranslation(request.description, request, langMap, data));
            add(def, 'bonus_description', adaptTranslation(request.bonus_description, request, langMap, data));

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
        langMap._lang = key; // parasite
        for (const path in langHub) {
            const tokens = langHub[path];
            for (const token of tokens) {
                assume(Object.keys(token).toString() === 'sid,text', token, 'Unexpected token structure!');
                const text = normalizeText(token.text, token.sid);
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
    let output = {};
    output = mergeDeep(output, DEFAULT_DATA);
    output = mergeDeep(output, {buffs});
    output = mergeDeep(output, request._data);
    return output;
}

/**
 *
 */
function adaptTranslation(textId, request, langMap, data, isDebug = false) {
    if (!textId) {
        return;
    }
    if (!langMap.has(textId)) {
        console.log(`Cannot find "${textId}" in translation cache!`);
        return;
    }
    isDebug = isDebug || (DEBUG.size && DEBUG.has(request.target_id) && langMap._lang === 'en');

    const text = langMap.get(textId);
    isDebug && console.log('===========' + textId);
    isDebug && console.log('Before:', text);

    let output = text;
    if (output.includes('{')) {
        output = output.replace(/\{(\d)}/g, (all, nr) => {
            return resolveArg(textId, nr, langMap, request, data, isDebug);
        });
        assume(!output.includes('{'), request, output, 'Still has braces!');
    }

    isDebug && console.log('After:', output);
    return output;
}

/**
 *
 */
function resolveArg(textId, nr, langMap, request, data, isDebug) {
    const argsList = args.get(textId);
    assume(argsList, request, textId, 'No args found!');
    const island = argsList[nr];

    const [functionName, redirect] = island.split('|');
    if (redirect) {
        assume(langMap.get(redirect), textId, redirect, 'Redirect not found!');
        return adaptTranslation(redirect, request, langMap, data, isDebug);
    }

    const evaluated = evaluate(functionName, scripts, data, isDebug);
    isDebug && console.log('evaluated:', evaluated);

    return evaluated;
}

/**
 *
 */
function normalizeText(text) {
    text = text.replace(/\n/g, '<br/>');
    text = text.replace(/ /g, ' '); // TODO: remove this
    text = text.replace(/‑/g, '-'); // TODO: remove this
    text = text.replace(/<b>/g, "'''"); // TODO: remove this
    text = text.replace(/<\/b>/g, "'''"); // TODO: remove this
    text = text.replace(/<i>/g, "''"); // TODO: remove this
    text = text.replace(/<\/i>/g, "''"); // TODO: remove this
    text = text.replace(/​/g, ''); // TODO: remove this
    return text;
}

/**
 *
 */
function normalizeName(value, lang) {
    return lang === 'en' ? value.replaceAll('’', "'") : value; // TODO: remove this
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default translate;
export {buildCache, checkExists};
