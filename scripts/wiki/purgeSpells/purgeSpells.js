import getSpells from '../spell/getSpells.js';
import purge from '../helpers/purge.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function purgeSpells() {
    let spells = getSpells();
    spells.push({
        name: {
            en: 'Summon Avatar (Spell)',
            pt_br: '',
            cs: '',
            fr: 'Invocation d’avatar (Sort)',
            de: '',
            hu: '',
            it: '',
            ja: '化身召喚 (呪文)',
            ko: '',
            pl: 'Przyzwanie Awatara (Zaklęcie)',
            ru: 'Призыв аватара (заклинание)',
            es: '',
            tr: '',
            uk: '',
            zh_hans: '',
            zh_hant: '',
        },
    });

    spells = spells.map((item) => ({
        name: {
            en: item.name.en,
            // fr: item.name.fr,
            // ja: item.name.ja,
            // pl: item.name.pl,
            // ru: item.name.ru,
        },
    }));

    purge(spells);
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await purgeSpells();
