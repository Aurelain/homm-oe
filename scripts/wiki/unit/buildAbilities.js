import joinLines from '../../utils/joinLines.js';
import buildHeading from '../helpers/buildHeading.js';
import assume from '../../utils/assume.js';
import filterHub from '../../helpers/filterHub.js';
import pushValid from '../../utils/pushValid.js';
import checkSharedAbility from '../cargo/helpers/checkSharedAbility.js';
import checkInterestingAbility from '../cargo/helpers/checkInterestingAbility.js';

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
        templates.push(`{{UnitAbility|lang=${lang}|id=${abilityId}}}`);
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
