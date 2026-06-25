import getTranslations from '../helpers/getTranslations.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function getSpells() {
    const blackList = [
        '~kara_',
        '_special.wiki',
        'astral_summon', // we're blacklisting Summon Avatar, because that one is handled manually
        'bonus_magic_kill_summon',
        'neutral_1_magic_back_to_garrison',
        'neutral_1_magic_mana_transfer',
        'night_bonus_magic_1_magic',
        'primal_bonus_magic_1_magic',
    ];
    let spells = getTranslations('/Spell~', 'spell', new RegExp(blackList.join('|')));
    return spells;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default getSpells;
