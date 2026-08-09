import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'day_1_magic_healing_water',
    // 'primal_5_magic_crystal_crown',
    // 'day_3_magic_haste',
]);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function Spell(zipHub) {
    const output = {};
    const spellFiles = filterHub(zipHub, 'DB/magics/.*?json', 'test_');
    for (const path in spellFiles) {
        const spells = spellFiles[path];
        for (const spell of spells) {
            const {id} = spell;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            console.log('id:', id);
            output['Spell~' + id] = buildDefinitions(spell, path);
        }
    }
    return output;
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function buildDefinitions(spell, path) {
    const output = [];
    output.push(...buildSpellDef(spell, path));
    for (let i = 0; i < spell.description.length; i++) {
        output.push(...buildSpellRankDef(spell, i + 1));
    }
    return output;
}

/**
 *
 */
function buildSpellDef(spell, path) {
    const def = {_type: 'SpellDef'};
    add(def, 'id', spell.id);
    add(def, 'name_sid', spell.name); // useless
    add(def, 'school', spell.school_);
    add(def, 'rank', spell.rank);
    add(def, 'used_on_map', spell.usedOnMap);
    add(def, 'icon', spell.icon);
    add(def, 'magic_type_description', spell.magicTypeDescription);
    add(def, 'is_special_magic', Boolean(spell.isSpecialMagic));
    add(def, 'is_unique_magic', Boolean(spell.isUniqueMagic));
    add(def, 'learn_cost_gemstones', spell.learnCost?.find((item) => item.name === 'gemstones')?.cost);
    add(def, 'learn_cost_crystals', spell.learnCost?.find((item) => item.name === 'crystals')?.cost);
    add(def, 'learn_cost_mercury', spell.learnCost?.find((item) => item.name === 'mercury')?.cost);
    add(def, 'up_effect_description_sid', spell.upEffectDescription);
    add(def, 'excaption_in_tooltip_sid', spell.excaptionInTooltip);
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: spell.id,
        type: 'spell',
        name: spell.name,
    });

    return [def, ...translationDefs];
}

/**
 *
 */
function buildSpellRankDef(spell, level) {
    const def = {_type: 'SpellRankDef'};
    add(def, 'spell_id', spell.id);
    add(def, 'level', level);
    add(def, 'description_sid', spell.description[level - 1]);
    add(def, 'bonus_description_sid', spell.bonusDescriptions?.[level - 2]?.description);
    add(def, 'mana_cost', spell.manaCost[level - 1]);
    add(def, 'upgrade_cost', spell.upgradeCost[level - 2]);

    const translationDefs = translate({
        target_id: spell.id,
        type: 'spell_rank',
        variant: level,
        description: spell.description[level - 1],
        bonus_description: spell.bonusDescriptions?.[level - 2]?.description,
        _data: {
            currentMagicBattleRoot: spell,
            currentMagicBattle: getCurrentMagicBattle(spell, level),
            currentMagicWorld: getCurrentMagicWorld(spell, level),
            currentMagicLevel: level,
        },
    });

    return [def, ...translationDefs];
}

/**
 *
 */
function getCurrentMagicBattle(spell, level) {
    const {magicDealers = [{}]} = spell.battleMagic || {};
    return magicDealers[level - 1] || magicDealers[0];
}

/**
 *
 */
function getCurrentMagicWorld(spell, level) {
    const {magicSettings = [{}]} = spell.worldMagic || {};
    return magicSettings[level - 1] || magicSettings[0];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default Spell;
