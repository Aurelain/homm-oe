import getWords from '../../helpers/getWords.js';
import assume from '../../../utils/assume.js';

const FACTION_ORDER = {
    human: 1,
    undead: 2,
    nature: 3,
    demon: 4,
    unfrozen: 5,
    dungeon: 6,
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildLaws(info, translations, context, parsed) {
    const enumeration = enumerateLawsFor(info, context, parsed.ids);
    if (enumeration.length) {
        enumeration.unshift(getWords('Laws_text', translations, info.lang));
    }
    return enumeration;
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function enumerateLawsFor(info, context, ids) {
    const {tier, faction, lang, id} = info;
    const baseId = id.replace('_alt', '').replace('_upg', '');
    let baseUnit = context.units.find((item) => item.id === baseId);
    if (!baseUnit) {
        console.warn(`Cannot find base id of ${id}! Using the id itself...`);
        baseUnit = info;
    }

    const nameEn = baseUnit.name.en;
    const laws = context.laws;
    let relevantLaws = [];
    relevantLaws.push(...findByGrowth(nameEn, laws));
    relevantLaws.push(...findByName(nameEn, laws));
    relevantLaws.push(...findByPossession(nameEn, laws));
    relevantLaws.push(...findByTier(tier, laws));
    if (faction !== 'neutral' && id !== 'lava_larva') {
        relevantLaws.push(...findInCitiesByTier(tier, laws));
    }
    relevantLaws = removeDuplicates(relevantLaws);

    const templates = [];
    for (const law of relevantLaws) {
        templates.push(`{{LawSummary|lang=${lang}|id=${law.target_id}}}`);
        const extraText = ids[law.target_id];
        if (extraText) {
            templates.push(extraText);
        }
    }

    let expectedLength = faction === 'neutral' ? 1 : 3;
    if (tier === 8) {
        expectedLength = 0;
    }
    if (faction === 'nature') {
        expectedLength = 4;
    }
    if (id === 'lava_larva') {
        expectedLength = 4;
    }
    if (id.match('vampir')) {
        expectedLength = 4;
    }
    assume(templates.length === expectedLength, id, templates, 'Unexpected laws count!');

    templates.sort(compare);

    return templates;
}

/**
 *
 */
function findByGrowth(nameEn, laws) {
    nameEn = nameEn.replace("'", '.');
    const re = new RegExp(`${nameEn} growth`, 'i');
    return laws.filter((law) => !!law.description.en.match(re));
}

/**
 *
 */
function findByName(nameEn, laws) {
    nameEn = nameEn.replace(/'/, '.');
    nameEn = nameEn.replace(/.$/, '');
    return laws.filter((law) => !!law.description.en.includes(nameEn));
}

/**
 *
 */
function findByPossession(nameEn, laws) {
    nameEn = nameEn.replace(/'/, '.');
    nameEn = nameEn.replace(/.$/, '');
    const re = new RegExp(`Your.*${nameEn}`, 'i');
    return laws.filter((law) => !!law.description.en.match(re));
}

/**
 *
 */
function findByTier(tier, laws) {
    const re = new RegExp(`Tier.${tier}.*?creatures`, 'i');
    return laws.filter((law) => !!law.description.en.match(re));
}

/**
 *
 */
function findInCitiesByTier(tier, laws) {
    const re = new RegExp(`Tier.${tier}.*?creature.*?cities`, 'i');
    return laws.filter((law) => !!law.description.en.match(re));
}

/**
 *
 */
function removeDuplicates(list) {
    const used = {};
    const output = [];
    for (const item of list) {
        if (!used[item.target_id]) {
            used[item.target_id] = true;
            output.push(item);
        }
    }
    return output;
}

/**
 *
 */
function compare(a, b) {
    const [, aFaction] = a.match(/_law_([a-z]+)/);
    const [, bFaction] = b.match(/_law_([a-z]+)/);
    const aRank = FACTION_ORDER[aFaction];
    const bRank = FACTION_ORDER[bFaction];
    if (aRank < bRank) {
        return -1;
    } else if (aRank > bRank) {
        return 1;
    }
    return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildLaws;
