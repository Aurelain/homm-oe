import getWords from '../../helpers/getWords.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildIntro(info, translations) {
    const {lang, faction, class_type} = info;
    const lines = [];

    let words = getWords('HeroClass_intro_' + class_type, translations, lang);
    words = words.replace('@name', '<b>' + info.name[lang] + '</b>');
    words = words.replace('@faction', `{{F|${faction}|${lang}}}`);
    const other = class_type === 'magic' ? 'might' : 'magic';
    words = words.replace('@other', `{{Class|${other}_${faction}|${lang}}}`);
    lines.push(words);

    return lines;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildIntro;
