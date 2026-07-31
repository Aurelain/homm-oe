import joinLines from '../../utils/joinLines.js';
import buildHeading from '../helpers/buildHeading.js';
import assume from '../../utils/assume.js';
import filterHub from '../../helpers/filterHub.js';
import pushValid from '../../utils/pushValid.js';
import checkSharedAbility from '../cargo/helpers/checkSharedAbility.js';
import checkInterestingAbility from '../cargo/helpers/checkInterestingAbility.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
// TODO: remove these when/if the game incorporates the ranks inside the ability name
const RANKS = {
    blade_dancer_upg_alt_passive_1: 2,
    crossbowman_upg_1: 1,
    avatar_of_war_upg_passive_1: 2,
    succubus_upg_alt_passive_1: 2,
    sunlight_cavalry_passive_1: 1,
    sunlight_cavalry_passive_2: 1,
    hydra_upg_passive_1: 1,
    succubus_passive_1: 1,
    crossbowman_1: 1,
    olgoi_upg_passive_2: 2,
    avatar_of_war_passive_1: 1,
    inquisitor_upg_alt_1: 2,
    graverobber_1: 1,
    griffin_1: 1,
    griffin_upg_alt_1: 2,
    locust_upg_alt_1: 2,
    druid_1: 1,
    lightweaver_upg_1: 2,
    hive_queen_upg_alt_1: 3,
    hive_queen_upg_1: 2,
    hive_queen_upg_2: 2,
    hive_queen_1: 1,
    hive_queen_2: 1,
    avatar_of_war_upg_alt_passive_1: 2,
    hydra_passive_1: 1,
    hydra_upg_alt_passive_1: 2,
    inquisitor_1: 1,
    blade_dancer_upg_passive_1: 1,
    lich_1: 1,
    lightweaver_1: 1,
    locust_1: 1,
    godslayer_upg_alt_passive_1: 2,
    crossbowman_upg_alt_1: 2,
    godslayer_upg_passive_1: 2,
    graverobber_upg_1: 2,
    succubus_upg_passive_1: 2,
    inquisitor_upg_1: 2,
    druid_upg_alt_1: 2,
    sunlight_cavalry_upg_passive_1: 2,
    sunlight_cavalry_upg_passive_2: 2,
    blade_dancer_passive_1: 1,
    flicker_upg_alt_passive_1: 1,
    olgoi_upg_alt_passive_2: 2,
    godslayer_passive_1: 1,
    lich_upg_alt_1: 2,
    jaw_1: 1,
    jaw_2: 1,
    jaw_3: 1,
    jaw_upg_alt_1: 2,
    jaw_upg_alt_2: 2,
    jaw_upg_alt_3: 2,
    druid_upg_1: 1,
    sunlight_cavalry_upg_alt_passive_1: 2,
    sunlight_cavalry_upg_alt_passive_2: 2,
    griffin_upg_1: 2,
    jaw_upg_1: 1,
    jaw_upg_2: 1,
    jaw_upg_3: 1,
    olgoi_passive_2: 1,
    flicker_passive_1: 1,
    flicker_upg_passive_1: 2,
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildAbilities(info, translations, context, ids = {}) {
    const enumeration = enumerateAbilities(info, context, ids);
    if (!enumeration) {
        return '';
    }

    const {lang} = info;
    const lines = [];
    lines.push('');
    lines.push(buildHeading('Abilities', translations, lang));
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
function enumerateAbilities(info, context, ids) {
    const {lang} = info;
    const abilities = collectUnitAbilities(info, context.zipHub);
    const templates = [];
    for (const abilityId of abilities) {
        const rank = abilityId in RANKS ? `|rank=${RANKS[abilityId]}` : '';
        templates.push(`{{UnitAbility|lang=${lang}|id=${abilityId}${rank}}}`);
        const extraText = ids[abilityId];
        if (extraText) {
            templates.push(extraText);
        }
    }

    // assume(templates.length >= 4, id, templates, 'Unexpected abilities count!');

    return templates.join('\n');
}

/**
 *
 */
function collectUnitAbilities(info, zipHub) {
    const {id, creature_type, shared_abilities, move_type} = info;

    const output = [];
    pushValid(output, creature_type);
    pushValid(output, getAttackTypeId(shared_abilities));
    pushValid(output, getMoveTypeId(move_type));
    pushValid(output, ...getAbilitiesFromZip(id, zipHub));

    return output;
}

/**
 *
 */
function getAttackTypeId(sharedAbilities) {
    const ids = sharedAbilities.split(',');
    const attackId = ids.find((id) => id.match(/^base_passive_[a-z]+_attack/));
    assume(attackId, sharedAbilities, 'Cannot find attack type!');
    return attackId.replace(/^base_passive_/, '').replace(/_name$/, '');
}

/**
 *
 */
function getMoveTypeId(moveType) {
    return moveType && moveType !== 'ground' ? moveType : undefined;
}

/**
 *
 */
function getAbilitiesFromZip(id, zipHub) {
    const viewsHub = filterHub(zipHub, `units_views.*/${id}_v.json$`);
    const values = Object.values(viewsHub);
    assume(values.length === 1, id, values.length, 'Unexpected views count!');
    const view = values[0][0];
    assume(view.id === id, id, view.id, 'Id mismatch!');

    const ids = [];
    let ordinal;

    // Passives:
    const {passives = []} = view;
    ordinal = 0;
    for (const {name} of passives) {
        if (checkSharedAbility(name, id)) {
            if (checkInterestingAbility(name)) {
                ids.push(name.replace('_name', ''));
            }
        } else {
            ordinal++;
            ids.push(id + '_passive_' + ordinal);
        }
    }

    // Actives:
    const actives = [...(view.alternativeAttacks || []), ...(view.abilities || [])];
    ordinal = 0;
    for (const {name} of actives) {
        if (checkSharedAbility(name, id)) {
            continue;
        }
        ordinal++;
        ids.push(id + '_' + ordinal);
    }

    return ids;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildAbilities;
