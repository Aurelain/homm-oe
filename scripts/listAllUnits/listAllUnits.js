import unzipCore from '../helpers/unzipCore.js';
import collectByPattern from '../helpers/collectByPattern.js';
import {writeFileSync} from 'fs';
import projectRoot from '../utils/projectRoot.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const FACTION_ORDER = ['Temple', 'Necropolis', 'Grove', 'Hive', 'Schism', 'Dungeon', 'Neutral'];
const FACTION_ID_TO_NAME = {
    human: 'Temple',
    undead: 'Necropolis',
    nature: 'Grove',
    demon: 'Hive',
    unfrozen: 'Schism',
    dungeon: 'Dungeon',
    neutral: 'Neutral',
};
const TIER_BONUS = 100000;
const UPGRADE_BONUS = 10000;

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function listAllUnits() {
    const zipHub = unzipCore();
    const units = collectByPattern(zipHub, /units_logics.*?\.json/);
    const englishTranslations = getEnglishTranslations(zipHub);

    const factionToUnits = {};
    for (const unit of units) {
        const {fraction} = unit;
        const name = FACTION_ID_TO_NAME[fraction];
        factionToUnits[name] = factionToUnits[name] || [];
        factionToUnits[name].push(unit);
    }

    let namedUnits = 0;
    let unnamedUnits = 0;
    let lines = [];
    lines.push('return {');
    for (const name of FACTION_ORDER) {
        lines.push('    ' + name + ' = {');
        const units = factionToUnits[name].sort(compareUnits);
        for (const unit of units) {
            const unitName = englishTranslations[unit.id + '_name'];
            if (!unitName) {
                unnamedUnits++;
                console.warn(`Cannot find name for ${unit.id}!`);
            } else {
                namedUnits++;
                lines.push(`        "${unitName}",`);
            }
        }
        lines.push('    },');
    }
    lines.push('}');
    let output = lines.join('\n');
    writeFileSync(projectRoot + '/scripts/listAllUnits/listAllUnits.txt', output);
    console.log(`Found ${namedUnits} named units and ${unnamedUnits} unnamed units.`);

    return output;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function getEnglishTranslations(zipHub) {
    const tokens = collectByPattern(zipHub, /english\/.*?unitsAbility\.json/);
    const output = {};
    for (const {sid, text} of tokens) {
        output[sid] = text.replaceAll('’', "'");
    }
    return output;
}

/**
 *
 */
function compareUnits(a, b) {
    return computeScore(a) - computeScore(b);
}

/**
 *
 */
function computeScore(unit) {
    const {tier, upgradeSid, baseSid, stats, expBonus} = unit;
    let score = 0;
    score += tier * TIER_BONUS;
    if (upgradeSid) {
        if (!baseSid) {
            score += 1 * UPGRADE_BONUS;
        } else {
            score += 2 * UPGRADE_BONUS;
        }
    } else {
        score += 3 * UPGRADE_BONUS;
    }
    score += expBonus + stats.hp;
    return score;
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
process.argv.join('').includes('listAllUnits') && listAllUnits();
export default listAllUnits;
