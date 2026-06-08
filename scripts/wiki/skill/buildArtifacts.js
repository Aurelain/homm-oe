// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildArtifacts({lang, skillId}, translations) {
    const lines = [];
    const section = translations.artifacts[lang] || translations.artifacts.en;
    lines.push(`=== ${section} ===`);
    lines.push(`{{#invoke:SkillArtifacts|display|lang=${lang}|skill=${skillId}}}`);
    return lines.join('\n');
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildArtifacts;
