import fs from 'node:fs';
import match from '../../utils/match.js';
import assume from '../../utils/assume.js';
import parseDefinition from '../helpers/parseDefinition.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function fattenSpells(spells) {
    const output = [];
    for (const spell of spells) {
        const {path} = spell;
        const content = fs.readFileSync(path, 'utf8');
        const [spellDef] = match(content, /\{\{SpellDef[\s\S]*?}}/);
        const definition = parseDefinition(spellDef);
        assume(definition.school, definition, 'School missing!');
        assume(definition.rank, definition, 'Rank missing!');
        output.push({
            ...definition,
            ...spell,
        });
    }
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default fattenSpells;
