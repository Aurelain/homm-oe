import assume from '../../utils/assume.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
// Languages ordered by number of speakers:
const ORDER = {
    en: 1,
    zh_hans: 2,
    es: 3,
    fr: 4,
    pt_br: 5,
    ru: 6,
    de: 7,
    ja: 8,
    tr: 9,
    ko: 10,
    it: 11,
    zh_hant: 12,
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
function suggestFileNames(list, switcheroos = {}) {
    const hub = {};
    for (const {name: nameHub} of list) {
        const byWiki = distributeByWiki(nameHub, switcheroos);
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
function distributeByWiki(nameHub, switcheroos) {
    const byWiki = {};
    const nameEn = nameHub.en;
    for (const lang in nameHub) {
        assume(lang in ORDER, lang, 'Unexpected language!');
        const wiki = suggestWikiName(nameHub[lang], lang, nameEn, switcheroos);
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
function suggestWikiName(name, lang, nameEn, switcheroos) {
    if (nameEn in switcheroos) {
        const suffix = switcheroos[nameEn][lang];
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
