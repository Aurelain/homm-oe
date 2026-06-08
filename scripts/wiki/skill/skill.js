import readFiles from '../helpers/readFiles.js';
import filter from '../../utils/filter.js';
import {LANG_COUNT, WIKI_DIR} from '../SETTINGS.js';
import assume from '../../utils/assume.js';
import match from '../../utils/match.js';
import dress from '../helpers/dress.js';
import {writeOds} from 'hucre/ods';
import fs from 'fs';
import createFreshSkill from './createFreshSkill.js';
import updateExistingSkill from './updateExistingSkill.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const SKILL_COUNT = 30; // sanity check

// Languages ordered by number of speakers:
const ORDER = {
    en: 1,
    zh_cn: 2,
    es: 3,
    fr: 4,
    pt_br: 5,
    ru: 6,
    de: 7,
    ja: 8,
    tr: 9,
    ko: 10,
    it: 11,
    zh_tw: 12,
    pl: 13,
    uk: 14,
    hu: 15,
    cs: 16,
};

const TRANSLATIONS = {
    // `tutorial_M_13_name_1` in `tutorial.json`
    heroSkills: {
        pt_br: 'Habilidades de Herói',
        cs: 'Schopnosti hrdiny',
        en: 'Hero Skills',
        fr: 'Compétences de héros',
        de: 'Heldenfähigkeiten',
        hu: 'A hősök képességei',
        it: "Abilità dell'eroe",
        ja: 'ヒーローのスキル',
        ko: '영웅 스킬',
        pl: 'Umiejętności bohatera',
        ru: 'Навыки героев',
        es: 'Habilidades del héroe',
        tr: 'Kahraman Becerileri',
        uk: 'Уміння героя',
        zh_cn: '英雄技能',
        zh_tw: '英雄技能',
    },
    levels: {
        pt_br: '',
        cs: '',
        en: 'Levels',
        fr: '',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: '',
        ru: '',
        es: '',
        tr: '',
        uk: '',
        zh_cn: '',
        zh_tw: '',
    },
    synergies: {
        pt_br: '',
        cs: '',
        en: 'Skill Synergies',
        fr: 'Synergies de compétences',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: 'Synergia',
        ru: 'Синергия навыков',
        es: '',
        tr: '',
        uk: '',
        zh_cn: '',
        zh_tw: '',
    },
    synergiesText: {
        pt_br: '',
        cs: '',
        en: 'Knowing # will give the following benefits to other sub-skills:',
        fr: 'Connaître la # apporte les avantages suivants aux autres compétences secondaires :',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: 'Znajomość umiejętności # zapewni następujące korzyści innym podumiejętnościom:',
        ru: 'Владение навыком «#» даёт следующие преимущества для других поднавыков:',
        es: '',
        tr: '',
        uk: '',
        zh_cn: '',
        zh_tw: '',
    },
    artifacts: {
        pt_br: '',
        cs: '',
        en: 'Artifact Effects',
        fr: "Effets d'artéfact",
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: '',
        ru: 'Эффекты артефактов',
        es: '',
        tr: '',
        uk: '',
        zh_cn: '',
        zh_tw: '',
    },
};

const TARGET_LANGUAGES = new Set([
    'en',
    // 'zh_cn',
    // 'es',
    'fr',
    // 'pt_br',
    'ru',
    // 'de',
    'ja',
    // 'tr',
    // 'ko',
    // 'it',
    // 'zh_tw',
    'pl',
    // 'uk',
    // 'hu',
    // 'cs',
]);

// Languages that use the `Skill/XX` page to store text:
const ROBOTIC_LANGUAGES = new Set([
    'en',
    'zh_cn',
    'es',
    'fr',
    'pt_br',
    // 'ru',
    'de',
    'ja',
    'tr',
    'ko',
    'it',
    'zh_tw',
    'pl',
    'uk',
    'hu',
    'cs',
]);

const SPECIAL_FILE_NAMES = {
    'Summon Avatar': 'Summon_Avatar_(Skill)',
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function skill() {
    const skillCargoFiles = getSkillCargoFiles();

    const skillPaths = suggestSkillPaths(skillCargoFiles);

    const emptyHub = createEmptyHub(skillPaths);
    const existingHub = parseExisting(skillPaths);
    const freshHub = createFreshHub(emptyHub, existingHub);
    writeToDisk(skillPaths, existingHub, freshHub);

    // await printHub(existingHub);
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function getSkillCargoFiles() {
    const cargoFiles = readFiles('Data');
    let skillCargoFiles = filter(cargoFiles, '/Skill~skill_', 'key');
    skillCargoFiles = filter(skillCargoFiles, (item) => !item.includes('pseudo'), 'key');
    const skillCount = Object.keys(skillCargoFiles).length;
    assume(skillCount === SKILL_COUNT, skillCargoFiles, `Expecting ${SKILL_COUNT} skills, got ${skillCount}!`);
    // enumerate(skillCargoFiles);
    return skillCargoFiles;
}

/**
 *
 */
function suggestSkillPaths(skillCargoFiles) {
    const hub = {};
    for (const name in skillCargoFiles) {
        const text = skillCargoFiles[name];
        const matched = match(text, /target_id = (\w+)\n.*?type = skill\n.*?language = (\w+)\n.*?name = ([^\n]*)/g);
        const langCount = matched.length;
        assume(langCount === LANG_COUNT, matched, `Expecting ${LANG_COUNT} languages, got ${langCount}!`);

        // English:
        const firstItem = matched.shift();
        const [, skillIdEn, langEn, nameEn] = firstItem;
        assume(langEn === 'en', langEn, 'Expecting English to be the first language!');
        const englishFileName = SPECIAL_FILE_NAMES[nameEn] || nameEn;
        const mainPath = WIKI_DIR + '/Main/' + dress(englishFileName);
        hub[mainPath] = {
            lang: langEn,
            name: nameEn,
            skillEn: nameEn,
            skillId: skillIdEn,
            path: mainPath,
            isRobotic: null, // separate from true or false
        };

        // Others:
        for (const item of matched) {
            const [, skillId, lang, name] = item;
            if (!TARGET_LANGUAGES.has(lang)) {
                continue;
            }
            assume(skillIdEn === skillId, 'Unexpected skillId!');
            const possiblePaths = [
                WIKI_DIR + '/Main/' + dress(englishFileName + '~' + lang), // robotic
                WIKI_DIR + '/Main/' + dress(name),
            ];
            for (let i = 0; i < possiblePaths.length; i++) {
                const safePath = resolveCollision(possiblePaths[i], lang, hub);
                hub[safePath] = {
                    lang,
                    name,
                    skillEn: nameEn,
                    skillId,
                    path: safePath,
                    isRobotic: i === 0,
                };
            }
        }
    }
    return hub;
}

/**
 *
 */
function resolveCollision(path, lang, hub) {
    const existingEntry = hub[path];
    if (!existingEntry) {
        return path;
    }
    const existingLang = existingEntry.lang;
    if (ORDER[existingLang] < ORDER[lang]) {
        // The existing language should be left alone. We're editing the current path.
        const suffixedPath = path.replace('.wiki', `_(${lang}).wiki`);
        console.log('Collision resolved: ' + undress(suffixedPath) + ` [favored ${existingLang}]`);
        return suffixedPath;
    } else {
        // The current language should become the principal. We'll add a suffix to the existing language.
        const suffixedPath = path.replace('.wiki', `_(${existingLang}).wiki`);
        console.log('Collision resolved: ' + undress(suffixedPath) + ` [favored ${lang}]`);
        delete hub[path];
        hub[suffixedPath] = existingEntry;
        return path;
    }
}

/**
 *
 */
function undress(path) {
    return path.replace(/.*?Main\//, '').replace('.wiki', '');
}

/**
 *
 */
function createEmptyHub(skillPaths) {
    const hub = {};
    for (const path in skillPaths) {
        const {lang, skillEn, skillId} = skillPaths[path];
        hub[skillEn] = hub[skillEn] || {id: skillId};
        hub[skillEn][lang] = skillPaths[path];
    }
    return hub;
}

/**
 *
 */
function parseExisting(skillPaths) {
    const hub = {};
    for (const path in skillPaths) {
        const {lang, skillEn, skillId} = skillPaths[path];
        hub[skillEn] = hub[skillEn] || {id: skillId};
        const content = getContent(path);
        if (content) {
            hub[skillEn][lang] = updateExistingSkill(skillPaths[path], TRANSLATIONS, content);
        }
    }
    return hub;
}

/**
 *
 */
function createFreshHub(emptyHub, existingHub) {
    const hub = {};
    for (const skillEn in emptyHub) {
        for (const lang of TARGET_LANGUAGES) {
            const existingInfo = existingHub[skillEn]?.[lang];
            if (!existingInfo) {
                const id = emptyHub[skillEn].id;
                hub[skillEn] = hub[skillEn] || {id};
                hub[skillEn][lang] = createFreshSkill(emptyHub[skillEn][lang], TRANSLATIONS);
            }
        }
    }
    return hub;
}

/**
 *
 */
function getContent(path) {
    if (!fs.existsSync(path)) {
        return;
    }
    let content = fs.readFileSync(path, 'utf8');
    if (!content || content.includes('REDIRECT')) {
        return;
    }
    return content;
}

/**
 *
 */
function extractBlurb(content) {
    const endings = ['\\{\\{Skill table', '\\{\\{#invoke'];
    for (const ending of endings) {
        const pattern = new RegExp('\\{loc.*?}}([\\S\\s]*?)' + ending);
        const [, zone] = match(content, pattern);
        if (zone) {
            return {zone: zone.trim(), clean: content.replace(zone, '')};
        }
    }
    return {zone: '', clean: content};
}

/**
 *
 */
function extractZone(content, lang, begin, legacyBegin) {
    const beginnings = [begin];
    const legacy = legacyBegin[lang];
    legacy && beginnings.push(legacy);
    for (const beginning of beginnings) {
        const pattern = new RegExp('(' + beginning + '[\\S\\s]*?)\\{\\{SkillsNav');
        const [, zone] = match(content, pattern);
        if (zone) {
            return {zone, clean: content.replace(zone, '')};
        }
    }
    return {zone: '', clean: content};
}

/**
 *
 */
async function printHub(hub) {
    const rows = buildGridFromHub(hub);
    const spreadsheetData = {
        sheets: [{name: 'skill', rows}],
    };
    const buffer = await writeOds(spreadsheetData);
    fs.writeFileSync(import.meta.dirname + '/skill.ods', buffer);
}

/**
 *
 */
function buildGridFromHub(hub) {
    const allPossibleHeaders = new Set([]);
    for (const key in hub) {
        for (const prop in hub[key]) {
            allPossibleHeaders.add(prop);
        }
    }
    const headers = ['Name', ...allPossibleHeaders];
    const columnToNr = {};
    const {length} = headers;
    for (let i = 0; i < length; i++) {
        columnToNr[headers[i]] = i;
    }
    const grid = [headers];
    for (const key in hub) {
        const row = [];
        row.push(key); // Name
        for (const prop in hub[key]) {
            const index = columnToNr[prop];
            row[index] = hub[key][prop];
        }
        grid.push(row);
    }
    return grid;
}

/**
 *
 */
function writeToDisk(skillPaths, existingHub, freshHub) {
    for (const path in skillPaths) {
        const {lang, isRobotic, name, skillEn} = skillPaths[path];
        let content;
        if (ROBOTIC_LANGUAGES.has(lang)) {
            // Non-Russian
            if (isRobotic === false) {
                // This is a natural language page (e.g. Stratégie)
                continue;
            } else {
                // This is a robotic page (e.g. Tactics/fr)
                content = existingHub[skillEn][lang] || freshHub[skillEn][lang];
            }
        } else {
            // This is Russian
            if (isRobotic === false) {
                // This is a natural language page (e.g. Нападение)
                content = existingHub[skillEn][lang] || freshHub[skillEn][lang];
            } else {
                // This is a robotic page (e.g. Offense/ru)
                content = '#REDIRECT [[' + name + ']]'; // todo account for renaming due to collisions
            }
        }
        // console.log(content);
        fs.writeFileSync(path, content);
    }
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await skill();
