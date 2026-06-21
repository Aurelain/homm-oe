import assume from '../../utils/assume.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
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

const WIKI_SUFFIXES = {
    'Summon Avatar': {
        en: 'Skill',
        zh_cn: '技能',
        es: 'Habilidad',
        fr: 'Compétence',
        pt_br: 'Habilidade',
        ru: 'навык',
        de: 'Fähigkeit',
        ja: 'スキル',
        tr: 'Beceri',
        ko: '스킬',
        it: 'Abilità',
        zh_tw: '技能',
        pl: 'Umiejętność',
        uk: 'Вміння',
        hu: 'Képesség',
        cs: 'Schopnost',
    },
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function suggestFileNames(list) {
    const hub = {};
    for (const {name: nameHub} of list) {
        const byWiki = distributeByWiki(nameHub);
        const byWikiSorted = sortByLanguageImportance(byWiki);
        const flattened = flatten(byWikiSorted);
        for (const key in flattened) {
            assume(!hub[key], key, 'Duplicate key!'); // highly unlikely
            hub[key] = flattened[key].replaceAll(' ', '_') + '.wiki';
        }
    }
    return hub;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 * Returns {
 *     'Foo Bar': ['en', 'fr', ..],
 *     'Foo Baz': ['de'],
 *     ...
 * }
 */
function distributeByWiki(nameHub) {
    const byWiki = {};
    const nameEn = nameHub.en;
    for (const lang in nameHub) {
        assume(lang in ORDER, lang, 'Unexpected language!');
        const wiki = suggestWikiName(nameHub[lang], lang, nameEn);
        byWiki[wiki] = byWiki[wiki] || [];
        byWiki[wiki].push({
            lang,
            name: nameHub[lang],
        });
    }
    return byWiki;
}

/**
 *
 */
function suggestWikiName(name, lang, nameEn) {
    if (nameEn in WIKI_SUFFIXES) {
        const suffix = WIKI_SUFFIXES[nameEn][lang];
        return name + ' (' + suffix + ')';
    } else {
        return name;
    }
}

/**
 *
 */
function sortByLanguageImportance(byName) {
    const sorted = {};
    for (const title in byName) {
        sorted[title] = byName[title].slice().sort(compareLanguageCodes);
    }
    return sorted;
}

/**
 *
 */
function compareLanguageCodes(a, b) {
    return ORDER[a.lang] - ORDER[b.lang];
}

/**
 *
 */
function flatten(byWikiSorted) {
    console.log('byWikiSorted:', byWikiSorted);
    const output = {};
    for (const wikiName in byWikiSorted) {
        const payload = byWikiSorted[wikiName];
        const firstItem = payload.shift();
        output[firstItem.name + '@' + firstItem.lang] = wikiName;
        for (const item of payload) {
            if (firstItem.lang === 'en') {
                output[item.name + '@' + item.lang] = wikiName + `~${item.lang}`;
            } else {
                output[item.name + '@' + item.lang] = wikiName + ` (${item.lang})`;
            }
        }
    }
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default suggestFileNames;
