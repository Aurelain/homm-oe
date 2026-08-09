import getWords from '../helpers/getWords.js';

const SUBCLASS_FACTIONS = {
    human: 'human',
    undead: 'undead',
    nature: 'nature',
    demon: 'demons', // plural!
    unfrozen: 'unfrozen',
    dungeon: 'dungeon',
    neutral: 'neutral',
};

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

    const subClassFaction = SUBCLASS_FACTIONS[faction];
    lines.push(`{{EliteClassBox|lang=${lang}|id=sub_class_${subClassFaction}_${class_type}_1}}`);
    lines.push(`{{EliteClassBox|lang=${lang}|id=sub_class_${subClassFaction}_${class_type}_2}}`);

    return lines;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildElites;
