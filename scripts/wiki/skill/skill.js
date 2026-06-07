import readFiles from '../helpers/readFiles.js';
import filter from '../../utils/filter.js';
import {LANG_COUNT, WIKI_DIR} from '../SETTINGS.js';
import assume from '../../utils/assume.js';
import match from '../../utils/match.js';
import dress from '../helpers/dress.js';

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

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function skill() {
    const skillCargoFiles = getSkillCargoFiles();

    const skillFutureNames = getSkillFutureNames(skillCargoFiles);
    // enumerate(skillFutureNames);

    // const mainFiles = readFiles('Main');
    // const enSkillFiles = filter(mainFiles, '[[Category:Hero Skills]]');
    // enumerate(enSkillFiles);
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
function getSkillFutureNames(skillCargoFiles) {
    const hub = {};
    const cleaned = [];
    for (const name in skillCargoFiles) {
        const text = skillCargoFiles[name];
        const matched = match(text, /target_id = (\w+)\n.*?type = skill\n.*?language = (\w+)\n.*?name = ([^\n]*)/g);
        const langCount = matched.length;
        assume(langCount === LANG_COUNT, matched, `Expecting ${LANG_COUNT} languages, got ${langCount}!`);

        // English:
        const firstItem = matched.shift();
        const [, skillIdEn, langEn, nameEn] = firstItem;
        assume(langEn === 'en', langEn, 'Expecting English to be the first language!');
        const mainPath = WIKI_DIR + '/Main/' + dress(nameEn);
        hub[mainPath] = {
            lang: langEn,
            skillEn: nameEn,
            skillId: skillIdEn,
        };

        // Others:
        for (const item of matched) {
            const [, skillId, lang, name] = item;
            assume(skillIdEn === skillId, 'Unexpected skillId!');
            const trafficPath = WIKI_DIR + '/Main/' + dress(nameEn + '~' + lang);
            hub[trafficPath] = {
                isTraffic: true,
                lang,
                skillEn: nameEn,
                skillId,
            };

            const pagePath = WIKI_DIR + '/Main/' + dress(name);
            const safePagePath = resolveCollision(pagePath, lang, hub);
            hub[safePagePath] = {
                lang,
                skillEn: nameEn,
                skillId,
            };
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

// =====================================================================================================================
//  R U N
// =====================================================================================================================
skill();
