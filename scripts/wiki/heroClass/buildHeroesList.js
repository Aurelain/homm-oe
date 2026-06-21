import joinLines from '../../utils/joinLines.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildHeroesList({lang, id}, translations) {
    const lines = [];
    const section = translations.heroes[lang] || translations.heroes.en;
    lines.push(`==${section}==`);
    lines.push(`{{#invoke:HeroesOverview|display|lang=${lang}|class=${id}}}`);
    return joinLines(lines);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildHeroesList;
