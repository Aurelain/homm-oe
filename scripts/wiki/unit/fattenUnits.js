import fs from 'node:fs';
import match from '../../utils/match.js';
import parseDefinition from '../helpers/parseDefinition.js';
import filterHub from '../../helpers/filterHub.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function fattenUnits(units, zipHub) {
    const heroInfo = filterHub(zipHub, 'english/texts/heroInfo', null, true);
    const unitsAbility = filterHub(zipHub, 'english/texts/unitsAbility', null, true);
    const idToSpecialist = linkIdToSpecialist(heroInfo, unitsAbility);

    const output = [];
    for (const unit of units) {
        const {path} = unit;

        const content = fs.readFileSync(path, 'utf8');
        const [unitDef] = match(content, /\{\{UnitDef[\s\S]*?}}/);
        const definition = parseDefinition(unitDef);

        const extra = {
            specialist: idToSpecialist[unit.target_id],
        };

        output.push({
            ...definition,
            ...unit,
            ...extra,
        });
    }
    return output;
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
export default fattenUnits;
