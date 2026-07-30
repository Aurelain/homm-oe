import filterHub from '../../helpers/filterHub.js';
import assume from '../../utils/assume.js';
import add from './add.js';
import translate, {checkExists} from './translate.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    'dragon',
    // 'black_dragon',
    // 'black_dragon_upg',
    // 'black_dragon_upg_alt',
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
    defs.push(...spawnUnitAbilityActiveDef(logic, view, 'alternativeAttacks', translations));
    defs.push(...spawnUnitAbilityActiveDef(logic, view, 'abilities', translations));
    defs.push(...spawnUnitAbilityGlobalDef(logic)); // useless
    defs.push(...spawnUnitAbilityAuraDef(logic)); // useless
    defs.push(...spawnUnitAbilityPassiveDef(logic, view, translations)); // useless
    defs.push(spawnUnitAttackDef(logic)); // useless

    if (!unitDef.unused) {
        defs.push(...translate(translations));
    }

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
    add(unitDef, 'move_type', logic.stats.moveType);

    add(unitDef, 'creature_type', getCreatureType(logic));
    add(unitDef, 'immunities', getImmunities(logic));
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
                if (!tag.endsWith('_immunities')) {
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
function getSharedAbilities(view) {
    const names = [];
    view.passives && names.push(...view.passives.map((ability) => ability.name));
    view.alternativeAttacks && names.push(...view.alternativeAttacks.map((ability) => ability.name));
    view.abilities && names.push(...view.abilities.map((ability) => ability.name));

    const shared = [];
    for (const name of names) {
        if (name.startsWith('base_')) {
            shared.push(name);
        } else {
            const first = name.split('_').shift();
            if (FACTIONS.has(first)) {
                shared.push(name);
            }
        }
    }
    return shared;
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
function spawnUnitAbilityActiveDef(logic, view, prop, translations) {
    const defs = [];
    const list = view[prop] || []; // e.g. `logic.alternativeAttacks`
    for (let i = 0; i < list.length; i++) {
        const logicItem = logic[prop][i] || {};
        const viewItem = list[i];
        const ordinal = viewItem.name.match(/\d+/) || viewItem.animationIndex;

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
        add(def, 'dont_use_energy', logicItem.dontUseEnergy);
        add(def, 'energy_level', logicItem.energyLevel);
        add(def, 'move_type_active', logicItem.moveType);
        add(def, 'action_cost', logicItem.actionCost);

        add(def, 'instacast', logicItem.damageDealer?.instacast);
        add(def, 'attack_pattern_sid', logicItem.damageDealer?.attackPatternSid);
        add(def, 'damage_target', logicItem.damageDealer?.damageTarget_);
        add(def, 'damage_type', logicItem.damageDealer?.damageType_);
        add(def, 'stat_dmg_mult', logicItem.damageDealer?.statDmgMult);
        add(def, 'trigger_counter', logicItem.damageDealer?.triggerCounter);
        add(def, 'shoot_range', logicItem.damageDealer?.shootRange);

        add(def, 'multitarget_type', logicItem.damageDealer?.multitargetType);
        add(def, 'buff_sid', logicItem.damageDealer?.buff?.sid);
        add(def, 'buff_target', logicItem.damageDealer?.buffTarget_);
        add(def, 'buff_duration', logicItem.damageDealer?.buff?.duration);

        add(def, 'cast_target', logicItem.damageDealer?.castTargetParams.castTarget_);
        add(def, 'cast_selection', logicItem.damageDealer?.castTargetParams.selection);
        add(def, 'cast_target_condition', logicItem.damageDealer?.castTargetParams.targetCondition_);
        add(def, 'cast_target_tags', logicItem.damageDealer?.castTargetParams.targetTags);

        add(def, 'affect_target', logicItem.damageDealer?.affectTargetParams.castTarget_);
        add(def, 'affect_selection', logicItem.damageDealer?.affectTargetParams.selection);
        add(def, 'affect_target_condition', logicItem.damageDealer?.affectTargetParams.targetCondition_);
        add(def, 'affect_target_tags', logicItem.damageDealer?.affectTargetParams.targetTags);

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
 *
 */
function spawnUnitAbilityPassiveDef(logic, view, translations) {
    const defs = [];
    const list = view.passives;
    let ordinal = 0;
    for (let i = 0; i < list.length; i++) {
        const viewItem = list[i];
        if (viewItem.name.startsWith('base_')) {
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
function spawnUnitAttackDef(logic) {
    const def = {_type: 'UnitAttackDef'};

    add(def, 'unit_id', logic.id);

    const defaultAttack = logic.defaultAttacks?.[0] || {};
    add(def, 'default_attack_type', ATTACK_TYPES[defaultAttack.attackType_]);
    add(def, 'default_damage_target', defaultAttack.damageDealer?.damageTarget_);
    add(def, 'default_affect_target', defaultAttack.damageDealer?.affectTargetParams.castTarget_);

    const counterAttack = logic.counterAttacks?.[0] || {};
    add(def, 'counter_attack_type', ATTACK_TYPES[counterAttack.attackType_]);
    add(def, 'counter_damage_target', counterAttack.damageDealer?.damageTarget_);
    add(def, 'counter_affect_target', counterAttack.damageDealer?.affectTargetParams.castTarget_);

    const alternativeAttack = logic.alternativeAttacks?.[0] || {};
    add(def, 'alt_attack_type', ATTACK_TYPES[alternativeAttack.attackType_]);
    add(def, 'alt_damage_target', alternativeAttack.damageDealer?.damageTarget_);
    add(def, 'alt_affect_target', alternativeAttack.damageDealer?.affectTargetParams.castTarget_);

    add(def, 'alt_trigger_counter', alternativeAttack.damageDealer?.triggerCounter);
    add(def, 'alt_cd', alternativeAttack.cd);
    add(def, 'alt_dont_use_energy', alternativeAttack.dontUseEnergy);
    add(def, 'alt_is_armed_ability', getIsArmed(alternativeAttack.damageDealer?.tags));

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
    return;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default unit;
