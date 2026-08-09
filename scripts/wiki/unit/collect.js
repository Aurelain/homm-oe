import Unit from '../cargo/Unit.js';
import collectMain from '../helpers/collectMain.js';
import match from '../../utils/match.js';
import filterHub from '../../helpers/filterHub.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function collect(zipHub) {
    const list = collectMain(zipHub, Unit);

    const heroInfo = filterHub(zipHub, 'english/texts/heroInfo', null, true);
    const unitsAbility = filterHub(zipHub, 'english/texts/unitsAbility', null, true);
    const idToSpecialist = linkIdToSpecialist(heroInfo, unitsAbility);

    for (const unit of list) {
        unit.specialist = idToSpecialist[unit.id];
    }

    return list;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function linkIdToSpecialist(heroInfo, unitsAbility) {
    const output = {};

    for (const hero of heroInfo) {
        const [, found] = match(hero.text, '(.*?) growth in your cities increases by');
        if (found) {
            for (const ability of unitsAbility) {
                if (ability.text === found) {
                    const id = ability.sid.replace('_name', '');
                    output[id] = hero.sid;
                    output[id + '_upg'] = hero.sid;
                    output[id + '_upg_alt'] = hero.sid;
                }
            }
        }
    }
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default collect;
