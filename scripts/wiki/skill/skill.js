import readFiles from '../helpers/readFiles.js';
import filter from '../../utils/filter.js';
import {LANG_COUNT, WIKI_DIR} from '../SETTINGS.js';
import assume from '../../utils/assume.js';
import match from '../../utils/match.js';
import dress from '../helpers/dress.js';
import {writeOds} from 'hucre/ods';
import fs from 'fs';

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

const SYNERGY_BEGIN = '===\\{\\{Words\\|wiki-skills-synergy-title';
const SYNERGY_BEGIN_LEGACY = {
    en: '=== ?Skill Syn',
    pl: '=== ?Synerg',
    fr: '=== ?Synerg',
    ru: '=== ?Синергия',
};

const ARTIFACTS_BEGIN = '===\\{\\{Words\\|wiki-skills-artifact-title';
const ARTIFACTS_BEGIN_LEGACY = {
    en: '=== ?Artifact',
    fr: "=== ?Effets d'art",
    ru: '=== ?Эффекты арт',
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

    const grid = buildGiantGrid(skillPaths);
    await printGrid(grid);

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

/**
 *
 */
function buildGiantGrid(skillPaths) {
    const grid = [];
    const header = ['Name'];
    for (const key in ORDER) {
        header.push(key);
    }
    grid.push(header);
    const byName = {};
    for (const path in skillPaths) {
        const {lang, skillEn} = skillPaths[path];
        const sections = parseSections(path, lang, skillEn);
        if (sections) {
            byName[skillEn] = byName[skillEn] || {};
            byName[skillEn][lang] = sections;
        }
    }
    for (const key in byName) {
        const row = [];
        row.push(key);
        for (const lang in byName[key]) {
            const index = ORDER[lang];
            const sections = byName[key][lang];
            let value = '';
            value += sections.blurb ? '1' : '0';
            value += sections.synergy ? '1' : '0';
            value += sections.artifacts ? '1' : '0';
            row[index] = sections.blurb;
        }
        grid.push(row);
    }
    return grid;
}

/**
 *
 */
function parseSections(path, lang, skillEn) {
    if (!fs.existsSync(path)) {
        return;
    }
    let content = fs.readFileSync(path, 'utf8');
    if (!content || content.includes('REDIRECT')) {
        return;
    }
    content = content.replaceAll(/\[\[Category.*?]]/g, '');
    const {zone: blurb, clean: noBlurb} = extractBlurb(content);
    content = noBlurb;
    const {zone: artifacts, clean: noArtifacts} = extractZone(content, lang, ARTIFACTS_BEGIN, ARTIFACTS_BEGIN_LEGACY);
    content = noArtifacts;
    const {zone: synergy, clean: noSynergy} = extractZone(content, lang, SYNERGY_BEGIN, SYNERGY_BEGIN_LEGACY);
    content = noSynergy;
    content = content.replace(/\{\{loc.*?}}/i, '');
    content = content.replace(/\{\{#invoke.*?}}/, '');
    content = content.replace(/\{\{Skill table[\s\S]*?<\/table>/, '');
    content = content.replace(/\{\{Skill table[\s\S]*?}}/, '');
    content = content.replace(/\{\{SkillsNavbox.*?}}/, '');
    content = content.replace(/__NOTOC__/, '');
    content = content.trim();
    if (skillEn !== 'Economy') {
        assume(!content, path, content, 'Still some content left');
    }
    if (lang === 'en') {
        // console.log('path:', path);
        // console.log('blurb:', blurb);
    }
    return {blurb, synergy, artifacts};
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
async function printGrid(rows) {
    const spreadsheetData = {
        sheets: [{name: 'skill', rows}],
    };
    const buffer = await writeOds(spreadsheetData);
    fs.writeFileSync(import.meta.dirname + '/skill.ods', buffer);
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await skill();
