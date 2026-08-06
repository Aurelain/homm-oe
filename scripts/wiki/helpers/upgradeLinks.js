import match from '../../utils/match.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const FACTIONS = {
    Temple: 'human',
    Necropolis: 'undead',
    Grove: 'nature',
    Hive: 'demon',
    Schism: 'unfrozen',
    Dungeon: 'dungeon',
    Neutral: 'neutral',
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function upgradeLinks(text, lang, context) {
    const links = collectLinks(text);

    text = upgradeFactions(text, lang, links);

    const unitNameToId = collectEnglishUnitNames(context.units);
    text = upgradeUnits(text, lang, links, unitNameToId);

    return text;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function collectLinks(text) {
    const output = {};
    const foundLinks = match(text, /\[\[(.*?)]]/g);
    for (const [, content] of foundLinks) {
        const [, page] = match(content, /^([^/:|]+)/);
        if (page) {
            output[page.trim()] = '[[' + content + ']]';
        }
    }
    return output;
}

/**
 *
 */
function upgradeFactions(text, lang, links) {
    for (const link in links) {
        const factionId = FACTIONS[link];
        if (factionId) {
            text = text.replaceAll(links[link], `{{F|${factionId}|${lang}}}`);
        }
    }
    return text;
}

/**
 *
 */
function collectEnglishUnitNames(units) {
    const output = {};
    for (const unit of units) {
        output[unit.name.en] = unit.id;
    }
    return output;
}

/**
 *
 */
function upgradeUnits(text, lang, links, unitNameToId) {
    for (const link in links) {
        const unitId = unitNameToId[link];
        if (unitId) {
            text = text.replaceAll(links[link], `{{Unit|${unitId}|${lang}}}`);
        }
    }
    return text;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default upgradeLinks;
