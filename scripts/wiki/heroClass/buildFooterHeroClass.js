import joinLines from '../../utils/joinLines.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildFooterHeroClass({lang}, translations) {
    const lines = [];
    lines.push(`{{HeroClassNavbox|lang=${lang}}}`);
    const category = translations.category_HeroClasses[lang] || translations.category_HeroClasses[lang] + '/' + lang;
    lines.push(`[[Category:${category}]]`);
    return joinLines(lines);
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildFooterHeroClass;
