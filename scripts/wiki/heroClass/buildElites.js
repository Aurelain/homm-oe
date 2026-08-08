import getWords from '../helpers/getWords.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildElites(info, translations) {
    const {id, lang, faction, class_type} = info;
    const lines = [];

    let words = getWords('Elite_text', translations, lang);
    words = words.replace('@name', '<b>' + info.name[lang] + '</b>');
    lines.push(words);

    lines.push(`{{EliteClassBox|lang=${lang}|id=sub_class_${faction}_${class_type}_1}}`);
    lines.push(`{{EliteClassBox|lang=${lang}|id=sub_class_${faction}_${class_type}_2}}`);

    return lines;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildElites;
