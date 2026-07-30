import filterHub from '../../helpers/filterHub.js';
import assume from '../../utils/assume.js';
import add from './add.js';
import translate, {checkExists} from './translate.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'dragon',
    // 'black_dragon',
    // 'black_dragon_upg',
    // 'black_dragon_upg_alt',
    // 'hive_queen_upg',
    // 'lava_larva',
    // 'inquisitor_upg_alt',
    // 'angel',
    // 'angel_upg',
    // 'druid_upg',
]);

const ATTACK_TYPES = {
    melee: 'melee_attack',
    shoot: 'ranged_attack',
    range: 'remote_attack',
};

const FACTIONS = new Set(['human', 'undead', 'nature', 'demon', 'unfrozen', 'dungeon', 'neutral']);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function unit(zipHub) {
    const output = {};
    const logics = filterHub(zipHub, /units_logics/);
    const views = filterHub(zipHub, /units_views/);
    for (const path in logics) {
        const id = logics[path][0].id;
        if (IDS.size && !IDS.has(id)) {
            continue;
        }
        console.log('id:', id);

        const viewsPath = path.replace('_logics/', '_views/').replace('_l.', '_v.');
        assume(views[viewsPath], viewsPath, 'Missing path!');

        const logic = logics[path];
        const view = views[viewsPath];
        assume(logic.length === 1 && view.length === 1, path, 'Too many items!');

        const result = parseUnit(logic[0], view[0], path);
        if (result) {
            output['Unit~' + result.id] = {
                defs: result.defs,
                footer: '[[Category:Game Data Import]]',
            };
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
function parseUnit(logic, view, path) {
    const defs = [];
    const translations = [];

    const unitDef = spawnUnitDef(logic, view, path, translations);
    defs.push(unitDef);
    defs.push(...spawnUnitAbilityActiveDef(logic, view, translations));
    defs.push(...spawnUnitAbilityAuraDef(logic)); // useless
    defs.push(...spawnUnitAbilityConditionalDef(logic)); // useless
    defs.push(...spawnUnitAbilityGlobalDef(logic)); // useless
    defs.push(...spawnUnitAbilityPassiveDef(logic, view, translations)); // useless
    defs.push(spawnUnitAttackDef(logic, unitDef)); // useless

    defs.push(...translate(translations));

    return {
        id: logic.id,
        defs,
    };
}

/**
 *
 */
function spawnUnitDef(logic, view, path, translations) {
    const unitDef = {_type: 'UnitDef'};
    const baseId = logic.id.replace(/_upg$|_alt$/, '');
    const isUnused = !checkExists(logic.id + '_name');

    add(unitDef, 'id', logic.id);
    add(unitDef, 'unused', isUnused ? true : null);
    add(unitDef, 'faction', logic.fraction);
    add(unitDef, 'tier', logic.tier);
    add(unitDef, 'source_path', path);
    add(unitDef, 'name_sid', logic.id + '_name');
    add(unitDef, 'desc_sid', logic.id + '_narrativeDescription');
    add(unitDef, 'base_sid', baseId === logic.id ? null : baseId);
    add(unitDef, 'upgrade_sid', logic.upgradeSid);

    add(unitDef, 'hp', logic.stats.hp);
    add(unitDef, 'offence', logic.stats.offence);
    add(unitDef, 'defence', logic.stats.defence);
    add(unitDef, 'damage_min', logic.stats.damageMin);
    add(unitDef, 'damage_max', logic.stats.damageMax);
    add(unitDef, 'initiative', logic.stats.initiative);
    add(unitDef, 'speed', logic.stats.speed);
    add(unitDef, 'luck', logic.stats.luck);
    add(unitDef, 'morale', logic.stats.moral);
    add(unitDef, 'energy_per_cast', logic.stats.energyPerCast);
    add(unitDef, 'energy_per_round', logic.stats.energyPerRound);
    add(unitDef, 'energy_per_take_damage', logic.stats.energyPerTakeDamage);
    add(unitDef, 'action_points', logic.stats.actionPoints);
    add(unitDef, 'num_counters', logic.stats.numCounters);
    add(unitDef, 'morale_min', logic.stats.moralMin);
    add(unitDef, 'morale_max', logic.stats.moralMax);
    add(unitDef, 'luck_min', logic.stats.luckMin);
    add(unitDef, 'luck_max', logic.stats.luckMax);
    add(unitDef, 'move_type', logic.stats.moveType || 'ground');

    add(unitDef, 'creature_type', getCreatureType(logic));
    add(unitDef, 'immunities', getImmunities(logic));
    add(unitDef, 'disablers', getDisablers(logic));
    add(unitDef, 'shared_abilities', getSharedAbilities(view));

    add(unitDef, 'gold_cost', getCost(logic, 'gold'));
    add(unitDef, 'wood_cost', getCost(logic, 'wood'));
    add(unitDef, 'ore_cost', getCost(logic, 'ore'));
    add(unitDef, 'mercury_cost', getCost(logic, 'mercury'));
    add(unitDef, 'dust_cost', getCost(logic, 'dust'));
    add(unitDef, 'crystal_cost', getCost(logic, 'crystals'));
    add(unitDef, 'gemstone_cost', getCost(logic, 'gemstones'));

    add(unitDef, 'native_biome', logic.nativeBiome);
    add(unitDef, 'ai_archetype', logic.ai);
    add(unitDef, 'tags', logic.tags);
    add(unitDef, 'leave_corpse', logic.leaveCorpse === false ? false : null);
    add(unitDef, 'squad_value', logic.squadValue);
    add(unitDef, 'exp_bonus', logic.expBonus);

    // Mutation:
    translations.push({
        target_id: logic.id,
        type: 'unit',
        name: unitDef.name_sid,
        description: unitDef.desc_sid,
    });

    return unitDef;
}

/**
 *
 */
function getCreatureType(logic) {
    const {passives = []} = logic;
    for (const item of passives) {
        const immunities = item?.data?.immunities || [];
        for (const immunity of immunities) {
            const {tags = []} = immunity;
            const found = tags.find((value) => value.endsWith('_immunities'));
            if (found) {
                return found.replace('_immunities', '');
            }
        }
    }
}

/**
 *
 */
function getImmunities(logic) {
    const output = [];
    const {passives = []} = logic;
    for (const item of passives) {
        const immunities = item?.data?.immunities || [];
        for (const immunity of immunities) {
            const {tags = []} = immunity;
            for (const tag of tags) {
                if (tag === 'avatar_immunities' || !tag.endsWith('_immunities')) {
                    output.push(tag);
                }
            }
        }
    }
    return output;
}

/**
 *
 */
function getDisablers(logic) {
    const output = [];
    const {passives = []} = logic;
    for (const item of passives) {
        const disablers = item?.data?.disablers || [];
        for (const disabler of disablers) {
            disabler.mech && output.push(disabler.mech);
        }
    }
    return output;
}

/**
 *
 */
function getSharedAbilities(view) {
    const allAbilities = [
        //
        ...(view.alternativeAttacks || []),
        ...(view.abilities || []),
        ...(view.passives || []),
    ];
    const shared = allAbilities.filter((ability) => checkSharedAbility(ability.name, view.id));
    return shared.map((item) => item.name);
}

/**
 *
 */
function getCost(logic, name) {
    const {costResArray = []} = logic.unitCost || {};
    for (const item of costResArray) {
        if (item.name === name) {
            return item.cost;
        }
    }
}

/**
 *
 */
function spawnUnitAbilityActiveDef(logic, view, translations) {
    const defs = [];
    const logicList = [...(logic.alternativeAttacks || []), ...(logic.abilities || [])];
    const viewList = [...(view.alternativeAttacks || []), ...(view.abilities || [])];
    let ordinal = 0;
    for (let i = 0; i < viewList.length; i++) {
        const logicItem = logicList[i] || {};
        const viewItem = viewList[i];
        if (checkSharedAbility(viewItem.name, logic.id)) {
            continue;
        }
        ordinal++;

        const def = {_type: 'UnitAbilityActiveDef'};

        add(def, 'ability_id', logic.id + '_' + ordinal);
        add(def, 'unit_id', logic.id);
        add(def, 'ability_type', 'active');
        add(def, 'ordinal', ordinal);
        add(def, 'name_sid', viewItem.name);
        add(def, 'desc_sid', viewItem.description);
        // add(def, 'active_type', viewItem.abilityType); // BONUS!
        // add(def, 'info_description', viewItem.infoDescription); // BONUS!
        add(def, 'attack_type', logicItem.attackType_);
        add(def, 'rank', logicItem.rank);
        add(def, 'cd', logicItem.cd);
        add(def, 'energy_level', logicItem.energyLevel);
        add(def, 'action_cost', logicItem.actionCost);
        add(def, 'charges', logicItem.charges);
        add(def, 'move_type_active', logicItem.moveType);
        add(def, 'dont_use_energy', logicItem.dontUseEnergy);
        add(def, 'disable_for_ai', logicItem.disableForAi);
        add(def, 'use_all_energy_levels', logicItem.useAllEnergyLevels);
        add(def, 'never_disable', logicItem.neverDisable);

        const dd = logicItem.damageDealer || {};
        add(def, 'untargeted_cast', dd.untargetedCast);
        add(def, 'instacast', dd.instacast);
        add(def, 'attack_pattern_sid', dd.attackPatternSid);
        add(def, 'damage_target', dd.damageTarget_);
        add(def, 'damage_type', dd.damageType_);
        add(def, 'stat_dmg_mult', dd.statDmgMult);
        add(def, 'trigger_counter', dd.triggerCounter);
        add(def, 'min_damage_per_energy_level', dd.minDamagePerEnergyLevel);
        add(def, 'max_damage_per_energy_level', dd.maxDamagePerEnergyLevel);
        add(def, 'use_speed_as_shoot_range', dd.useSpeedAsShootRange);
        add(def, 'temp_self_buff', dd.tempSelfBuff);
        add(def, 'multitarget_type', dd.multitargetType);
        add(def, 'num_targets', dd.numTargets);
        add(def, 'min_base_dmg', dd.minBaseDmg);
        add(def, 'max_base_dmg', dd.maxBaseDmg);
        add(def, 'min_stack_dmg', dd.minStackDmg);
        add(def, 'max_stack_dmg', dd.maxStackDmg);
        add(def, 'damage_multipler_per_hero_level', dd.damageMultiplerPerHeroLevel);
        add(def, 'buff_sid', dd.buff?.sid);
        add(def, 'buff_target', dd.buffTarget_);
        add(def, 'buff_duration', dd.buff?.duration);
        add(def, 'buff_charges', dd.buff?.charges);
        add(def, 'shoot_range', dd.shootRange);
        add(def, 'shoot_threshold', dd.shootThreshold);
        add(def, 'shoot_red_count', dd.shootRedCount);
        add(def, 'shoot_dmg_buff', dd.shootDmgBuff);

        add(def, 'cast_target', dd.castTargetParams?.castTarget_);
        add(def, 'cast_selection', dd.castTargetParams?.selection);
        add(def, 'cast_target_condition', dd.castTargetParams?.targetCondition_);
        add(def, 'cast_target_tags', dd.castTargetParams?.targetTags);

        add(def, 'affect_target', dd.affectTargetParams?.castTarget_);
        add(def, 'affect_selection', dd.affectTargetParams?.selection);
        add(def, 'affect_target_condition', dd.affectTargetParams?.targetCondition_);
        add(def, 'affect_target_tags', dd.affectTargetParams?.targetTags);

        defs.push(def);

        // Mutation:
        translations.push({
            target_id: def.ability_id,
            type: 'unit_ability',
            name: def.name_sid,
            description: def.desc_sid,
            _data: {
                currentAbility: logicItem,
                currentUnitConfig: logic,
            },
        });
    }
    return defs;
}

/**
 * Useless, but we'll add it for parity with obelisk.
 */
function spawnUnitAbilityGlobalDef(logic) {
    const defs = [];
    const list = logic.globalPassives || [];
    for (let i = 0; i < list.length; i++) {
        const logicItem = list[i];
        const ordinal = i + 1;

        const def = {_type: 'UnitAbilityGlobalDef'};

        add(def, 'ability_id', logic.id + '_global_passive_' + ordinal);
        add(def, 'unit_id', logic.id);
        add(def, 'ability_type', 'global_passive');
        add(def, 'ordinal', ordinal);
        add(def, 'name_sid', def.ability_id + '_name');

        add(def, 'global_target', logicItem.target);
        add(def, 'global_power', logicItem.power);
        add(def, 'global_tag', logicItem.tag);

        add(def, 'affected_stat', Object.keys(logicItem.data?.stats || {})[0]); // absurd to only get the first!
        add(def, 'affected_stat_amount', logicItem.data?.stats?.[def.affected_stat]);
        if ('affected_stat_amount' in def) {
            def.affected_stat_amount += '.0'; // absurd
        }

        defs.push(def);
    }
    return defs;
}

/**
 * Useless, but we'll add it for parity with obelisk.
 */
function spawnUnitAbilityAuraDef(logic) {
    const defs = [];
    const list = logic.aura ? [logic.aura] : [];
    for (let i = 0; i < list.length; i++) {
        const logicItem = list[i];
        const ordinal = i + 1;

        const def = {_type: 'UnitAbilityAuraDef'};

        add(def, 'ability_id', logic.id + '_aura_' + ordinal);
        add(def, 'unit_id', logic.id);
        add(def, 'ability_type', 'aura');
        add(def, 'ordinal', ordinal);
        add(def, 'name_sid', def.ability_id + '_name');

        add(def, 'aura_target', logicItem.target);
        add(def, 'aura_power', logicItem.power);
        add(def, 'aura_radius', logicItem.radius);
        add(def, 'aura_tag', logicItem.tag);

        const stats = logicItem.data?.stats || {};
        const affectedStat = Object.keys(stats)[0]; // absurd to only get the first!
        add(def, 'affected_stat', affectedStat);
        if (typeof stats[affectedStat] === 'number') {
            add(def, 'affected_stat_amount', stats[affectedStat] + '.0'); // absurd
        }

        defs.push(def);
    }
    return defs;
}

/**
 * Useless, but we'll add it for parity with obelisk.
 */
function spawnUnitAbilityConditionalDef(logic) {
    const defs = [];
    const list = logic.conditionalPassives || [];
    for (let i = 0; i < list.length; i++) {
        const logicItem = list[i];
        const ordinal = i + 1;

        const def = {_type: 'UnitAbilityConditionalDef'};

        add(def, 'ability_id', logic.id + '_conditional_passive_' + ordinal);
        add(def, 'unit_id', logic.id);
        add(def, 'ability_type', 'conditional_passive');
        add(def, 'ordinal', ordinal);
        add(def, 'name_sid', def.ability_id + '_name');

        add(def, 'condition_check', logicItem.condition?.[0]);
        add(def, 'condition_target', logicItem.condition?.[1]);
        add(def, 'condition_value', logicItem.condition?.[2]);

        const stats = logicItem.stats || {};
        const affectedStat = Object.keys(stats)[0]; // absurd to only get the first!
        add(def, 'affected_stat', affectedStat);
        if (typeof stats[affectedStat] === 'number') {
            add(def, 'affected_stat_amount', stats[affectedStat] + '.0'); // absurd
        }

        defs.push(def);
    }
    return defs;
}

/**
 *
 */
function spawnUnitAbilityPassiveDef(logic, view, translations) {
    const defs = [];
    const list = view.passives;
    let ordinal = 0;
    for (let i = 0; i < list.length; i++) {
        const viewItem = list[i];
        if (checkSharedAbility(viewItem.name, logic.id)) {
            continue;
        }
        ordinal++;

        const def = {_type: 'UnitAbilityPassiveDef'};

        add(def, 'ability_id', logic.id + '_passive_' + ordinal);
        add(def, 'unit_id', logic.id);
        add(def, 'ability_type', 'passive');
        add(def, 'ordinal', ordinal);
        add(def, 'name_sid', viewItem.name);
        add(def, 'desc_sid', viewItem.description);

        defs.push(def);

        translations.push({
            target_id: def.ability_id,
            type: 'unit_ability',
            name: def.name_sid,
            description: def.desc_sid,
            _data: {
                currentUnitConfig: logic,
            },
        });
    }
    return defs;
}

/**
 * Useless, but we'll add it for parity with obelisk.
 */
function spawnUnitAttackDef(logic, unitDef) {
    const def = {_type: 'UnitAttackDef'};

    add(def, 'unit_id', logic.id);

    const defaultAttack = logic.defaultAttacks?.[0] || {};
    add(def, 'default_attack_type', clarifyAttack(defaultAttack.attackType_, unitDef));
    add(def, 'default_damage_target', defaultAttack.damageDealer?.damageTarget_, 'enemy');
    add(def, 'default_affect_target', defaultAttack.damageDealer?.affectTargetParams.castTarget_, 'enemy');
    add(def, 'default_trigger_counter', defaultAttack.damageDealer?.triggerCounter, true);
    add(def, 'default_dont_trigger_energy_regen', defaultAttack.damageDealer?.dontTriggerEnergyRegen);
    add(def, 'default_buff_sid', defaultAttack.damageDealer?.buff?.sid);
    add(def, 'default_buff_target', defaultAttack.damageDealer?.buffTarget_);
    add(def, 'default_buff_duration', defaultAttack.damageDealer?.buff?.duration);

    const counterAttack = logic.counterAttacks?.[0] || {};
    add(def, 'counter_attack_type', ATTACK_TYPES[counterAttack.attackType_]);
    add(def, 'counter_stat_dmg_mult', counterAttack.damageDealer?.statDmgMult, 1);
    add(def, 'counter_buff_sid', counterAttack.damageDealer?.buff?.sid);
    add(def, 'counter_buff_target', counterAttack.damageDealer?.buffTarget_);
    add(def, 'counter_buff_duration', counterAttack.damageDealer?.buff?.duration);
    add(def, 'counter_damage_target', counterAttack.damageDealer?.damageTarget_, 'enemy');
    add(def, 'counter_affect_target', counterAttack.damageDealer?.affectTargetParams.castTarget_, 'enemy');
    add(def, 'counter_dont_trigger_energy_regen', counterAttack.damageDealer?.dontTriggerEnergyRegen);
    add(def, 'counter_is_armed_ability', getIsArmed(counterAttack.damageDealer?.tags));

    const alternativeAttack = logic.alternativeAttacks?.[0] || {};
    add(def, 'alt_attack_type', ATTACK_TYPES[alternativeAttack.attackType_]);
    add(def, 'alt_stat_dmg_mult', alternativeAttack.damageDealer?.statDmgMult, 0.5);
    add(def, 'alt_damage_target', alternativeAttack.damageDealer?.damageTarget_, 'enemy');
    add(def, 'alt_affect_target', alternativeAttack.damageDealer?.affectTargetParams.castTarget_, 'enemy');
    add(def, 'alt_trigger_counter', alternativeAttack.damageDealer?.triggerCounter, false);
    add(def, 'alt_buff_sid', alternativeAttack.damageDealer?.buff?.sid);
    add(def, 'alt_buff_target', alternativeAttack.damageDealer?.buffTarget_);
    add(def, 'alt_buff_duration', alternativeAttack.damageDealer?.buff?.duration);
    add(def, 'alt_cd', alternativeAttack.cd);
    add(def, 'alt_dont_use_energy', alternativeAttack.dontUseEnergy);
    add(def, 'alt_never_disable', alternativeAttack.neverDisable);
    add(def, 'alt_return_to_start_after_attack', alternativeAttack.returnToStartAfterAttack);
    add(def, 'alt_temp_self_buff', alternativeAttack.damageDealer?.tempSelfBuff);
    add(def, 'alt_is_armed_ability', getIsArmed(alternativeAttack.damageDealer?.tags));

    const alt2 = logic.alternativeAttacks?.[1] || {};
    add(def, 'alt2_attack_type', ATTACK_TYPES[alt2.attackType_]);
    add(def, 'alt2_stat_dmg_mult', alt2.damageDealer?.statDmgMult, 0.5);
    add(def, 'alt2_trigger_counter', alt2.damageDealer?.triggerCounter, false);
    add(def, 'alt2_buff_sid', alt2.damageDealer?.buff?.sid);
    add(def, 'alt2_buff_target', alt2.damageDealer?.buffTarget_);
    add(def, 'alt2_buff_duration', alt2.damageDealer?.buff?.duration);
    add(def, 'alt2_cd', alt2.cd);
    add(def, 'alt2_dont_use_energy', alt2.dontUseEnergy);
    add(def, 'alt2_multitarget_type', alt2.damageDealer?.multitargetType);
    add(def, 'alt2_num_targets', alt2.damageDealer?.numTargets);
    add(def, 'alt2_is_armed_ability', getIsArmed(alt2.damageDealer?.tags));

    return def;
}

/**
 * Useless, but we'll add it for parity with obelisk.
 */
function getIsArmed(tags) {
    if (!Array.isArray(tags)) {
        return;
    }
    for (const tag of tags) {
        if (tag.startsWith('armed_ability')) {
            return true;
        }
    }
}

/**
 *
 */
function checkSharedAbility(name, id) {
    if (name.startsWith('base_') || name.startsWith('common_')) {
        return true;
    }
    const first = name.split('_').shift();
    if (id.startsWith(first)) {
        return false; // unfrozen_cultist
    }
    return FACTIONS.has(first);
}

/**
 *
 */
function clarifyAttack(value, unitDef) {
    value = ATTACK_TYPES[value];
    if (!value) {
        return;
    }
    const {shared_abilities} = unitDef;
    for (const name of shared_abilities) {
        if (name.startsWith('base_passive_' + value)) {
            return name.replace('base_passive_', '').replace('_name', '');
        }
    }
    return value;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default unit;
