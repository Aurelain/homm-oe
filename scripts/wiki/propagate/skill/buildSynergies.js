import getWords from '../../helpers/getWords.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildSynergies(info, translations) {
    const {lang, name, id} = info;
    const lines = [];

    let synergiesText = getWords('synergiesText', translations, lang);
    synergiesText = synergiesText.replace('@skillName', `'''${name[lang]}'''`);
    lines.push(synergiesText);

    lines.push(`{{#invoke:SkillSynergies|display|lang=${lang}|skill=${id}}}`);

    return lines.join('\n');
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildSynergies;
