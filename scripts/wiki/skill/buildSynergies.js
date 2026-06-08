// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildSynergies({lang, name, skillId}, translations) {
    const lines = [];

    const section = translations.synergies[lang] || translations.synergies.en;
    lines.push(`=== ${section} ===`);

    let synergiesText = translations.synergiesText[lang] || translations.synergiesText.en;
    synergiesText = synergiesText.replace('#', `'''${name}'''`);
    lines.push(synergiesText);

    lines.push(`{{#invoke:SkillSynergies|display|lang=${lang}|skill=${skillId}}}`);
    return lines.join('\n');
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildSynergies;
