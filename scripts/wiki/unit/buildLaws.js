import joinLines from '../../utils/joinLines.js';
import buildHeading from '../helpers/buildHeading.js';
import getWords from '../helpers/getWords.js';
import assume from '../../utils/assume.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildLaws(info, translations, ids = {}) {
    const enumeration = enumerateLawsFor(info, ids);
    if (!enumeration) {
        return '';
    }

    const {lang} = info;
    const lines = [];
    lines.push('');
    lines.push(buildHeading('Laws', translations, lang));
    lines.push(getWords('Laws_text', translations, lang));
    lines.push(enumeration);
    lines.push('');
    return joinLines(lines);
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function enumerateLawsFor(info, ids) {
    const {tier, faction, context, lang, id} = info;
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
    if (faction !== 'neutral') {
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
    if (tier === '8') {
        expectedLength = 0;
    }
    if (faction === 'nature') {
        expectedLength = 4;
    }
    if (id === 'lava_larva') {
        expectedLength = 5;
    }
    if (id.match('vampir')) {
        expectedLength = 4;
    }
    assume(templates.length === expectedLength, id, templates, 'Unexpected laws count!');

    return templates.join('\n');
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

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildLaws;
