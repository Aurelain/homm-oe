import getWords from '../helpers/getWords.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildSkills(info, translations) {
    const {id, lang, class_type} = info;
    const lines = [];

    let words = getWords('HeroClass_Skills_' + class_type, translations, lang);
    words = words.replace('@name', '<b>' + info.name[lang] + '</b>');
    const skill = class_type === 'magic' ? 'wisdom' : 'battle_artistry';
    words = words.replace('@skill', `{{Skill|${skill}|${lang}}}`);
    lines.push(words);

    let generic = getWords('HeroClass_Skills_generic', translations, lang);
    generic = generic.replace('@name', '<b>' + info.name[lang] + '</b>');
    lines.push('');
    lines.push(generic);

    lines.push(`{{HeroClassSkills|lang=${lang}|id=${id}}}`);

    return lines;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildSkills;
