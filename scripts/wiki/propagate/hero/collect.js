import Hero from '/a/aims/oe-wiki/src/parse/parsers/Hero.js';
import collectMain from '../../helpers/collectMain.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function collect(zipHub) {
    const allHeroes = collectMain(zipHub, Hero);
    const skirmishHeroes = allHeroes.filter((skill) => {
        return !skill.id.startsWith('campaign') && !skill.id.startsWith('tutorial') && !skill.id.startsWith('cm_fun');
    });
    return skirmishHeroes;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default collect;
