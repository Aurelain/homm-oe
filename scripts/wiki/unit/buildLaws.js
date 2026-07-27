import joinLines from '../../utils/joinLines.js';
import buildHeading from '../helpers/buildHeading.js';
import getWords from '../helpers/getWords.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildLaws(info, translations) {
    const {lang} = info;
    const lines = [];
    lines.push('');
    lines.push(buildHeading('Laws', translations, lang));
    lines.push(getWords('Laws_text', translations, lang));
    lines.push(enumerateLawsFor(info));
    lines.push('');
    return joinLines(lines);
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function enumerateLawsFor(info) {
    const {name, tier, faction, context, lang} = info;
    const nameEn = name.en;
    const laws = context.laws;
    const relevantLaws = [];
    relevantLaws.push(...findByGrowth(nameEn, laws));
    relevantLaws.push(...findByTier(tier, laws));
    if (faction !== 'neutral') {
        relevantLaws.push(...findInCitiesByTier(tier, laws));
    }

    const templates = [];
    for (const law of relevantLaws) {
        templates.push(`{{LawSummary|lang=${lang}|id=${law.target_id}}}`);
    }

    return templates.join('\n');
}

/**
 *
 */
function findByGrowth(nameEn, laws) {
    const re = new RegExp(`${nameEn} growth`, 'i');
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

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildLaws;
