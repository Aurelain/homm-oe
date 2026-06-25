import fs from 'node:fs';
import suggestFileNames from '../helpers/suggestFileNames.js';
import handleFreshSpell from './handleFreshSpell.js';
import handleOldSpell from './handleOldSpell.js';
import getTranslations from '../helpers/getTranslations.js';
import generatePayloads from '../helpers/generatePayloads.js';
import enumerate from '../../utils/enumerate.js';
import fattenSpells from './fattenSpells.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const TRANSLATIONS = {
    Spells: {
        pt_br: 'Feitiços',
        cs: 'Kouzla',
        en: 'Spells',
        fr: 'Sorts',
        de: 'Zaubersprüche',
        hu: 'Varázslatok',
        it: 'Incantesimi',
        ja: '呪文',
        ko: '주문',
        pl: 'Zaklęcia',
        ru: 'Заклинания',
        es: 'Hechizos',
        tr: 'Büyüler',
        uk: 'Чари',
        zh_cn: '法术',
        zh_tw: '法術',
    },
    Strategy: {
        pt_br: '',
        cs: '',
        en: 'Strategy',
        fr: 'Stratégie',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: 'Strategia',
        ru: 'Стратегия',
        es: '',
        tr: '',
        uk: '',
        zh_cn: '',
        zh_tw: '',
    },
    Strategy_text: {
        pt_br: '',
        cs: '',
        en: 'Nothing yet. Maybe you can add it...?',
        fr: '',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: 'Jeszcze nic. Może możesz to dodać...?',
        ru: 'Здесь пока ничего нет. Возможно, вы сможете это исправить?',
        es: '',
        tr: '',
        uk: '',
        zh_cn: '',
        zh_tw: '',
    },
    Interactions: {
        pt_br: '',
        cs: '',
        en: 'Interactions and Synergies',
        fr: '',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: '',
        ru: '',
        es: '',
        tr: '',
        uk: '',
        zh_cn: '',
        zh_tw: '',
    },
    Interactions_text: {
        pt_br: '',
        cs: '',
        en: 'Nothing yet. Maybe you can add some...?',
        fr: '',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: 'Jeszcze nic. Może możesz to dodać...?',
        ru: 'Здесь пока ничего нет. Возможно, вы сможете это исправить?',
        es: '',
        tr: '',
        uk: '',
        zh_cn: '',
        zh_tw: '',
    },
    Specialist: {
        pt_br: '',
        cs: '',
        en: 'Specialist Hero',
        fr: '',
        de: '',
        hu: '',
        it: '',
        ja: '',
        ko: '',
        pl: '',
        ru: '',
        es: '',
        tr: '',
        uk: '',
        zh_cn: '',
        zh_tw: '',
    },
};

const TARGET_LANGUAGES = new Set([
    'en',
    // 'zh_cn',
    // 'es',
    // 'fr',
    // 'pt_br',
    // 'ru',
    // 'de',
    // 'ja',
    // 'tr',
    // 'ko',
    // 'it',
    // 'zh_tw',
    // 'pl',
    // 'uk',
    // 'hu',
    // 'cs',
]);

const IDS = [
    //'bonus_magic_astral_summon_1',
    // 'bonus_magic_pure_bolt',
    //'change_use_necromancy',
    //'day_10_magic_second_song',
    //'day_11_magic_masterful_parry',
    //'day_12_magic_radiant_armor',
    //'day_13_magic_holy_arms',
    //'day_14_magic_vengeance',
    //'day_15_magic_judgement',
    //'day_16_magic_arinas_chosen',
    //'day_17_magic_clear_view',
    //'day_18_magic_farsight',
    'day_1_magic_healing_water',
    // 'day_2_magic_sharp_edge',
    //'day_3_magic_haste',
    //'day_4_magic_favorable_wind',
    //'day_5_magic_shorten_shadow',
    //'day_6_magic_cleansing_ray',
    //'day_7_magic_inner_light',
    //'day_8_magic_taunt',
    //'day_9_magic_arinas_hymn',
    //'neutral_1_magic_back_to_city',
    //'neutral_1_magic_mana_restore',
    //'neutral_1_magic_units_replace',
    //'neutral_magic_dimension_door',
    //'neutral_magic_light_gate',
    //'neutral_magic_pocket_dimension',
    //'neutral_magic_second_sight',
    //'neutral_magic_shadow_form',
    //'neutral_magic_town_portal',
    //'night_10_magic_silence',
    //'night_11_magic_vulnerability',
    //'night_12_magic_summon_starchild',
    //'night_13_magic_berserker',
    //'night_14_magic_nairas_kiss',
    //'night_15_magic_deaths_call',
    //'night_16_magic_shadow_army',
    //'night_17_magic_read_minds',
    //'night_18_magic_nairas_veil',
    //'night_1_magic_unnatural_calm',
    //'night_2_magic_web',
    //'night_3_magic_enlarge_shadow',
    //'night_4_magic_despair',
    //'night_5_magic_shade_cloak',
    //'night_6_magic_deaths_grip',
    //'night_7_magic_fatal_decay',
    //'night_8_magic_sleep',
    //'night_9_magic_twilight',
    //'primal_10_magic_primordial_purity',
    //'primal_11_magic_armageddon',
    //'primal_12_magic_chain_lightning',
    //'primal_13_magic_avalanche',
    //'primal_14_magic_hksmillas_rampage',
    //'primal_15_magic_summon_primal_remnant',
    //'primal_16_magic_stone_fangs',
    //'primal_17_magic_groundsight',
    //'primal_18_magic_primordial_chaos',
    //'primal_1_magic_thunderbolt',
    //'primal_2_magic_thick_hide',
    //'primal_3_magic_wean',
    //'primal_4_magic_fire_globe',
    //'primal_5_magic_crystal_crown',
    // 'primal_6_magic_ice_bolt',
    //'primal_7_magic_wall_of_flame',
    //'primal_8_magic_cave_in',
    //'primal_9_magic_earths_rage',
    //'space_10_magic_mirror_copy',
    //'space_11_magic_decimate',
    //'space_12_magic_rewind',
    //'space_13_magic_black_hole',
    //'space_14_magic_doreaths_tide',
    //'space_15_magic_trap_snare',
    //'space_16_magic_reality_distortion',
    //'space_17_magic_reinforcements',
    //'space_18_magic_assemble',
    //'space_1_magic_early_start',
    //'space_2_magic_energy_explosion',
    //'space_3_magic_energyze',
    //'space_4_magic_optical_illusion',
    //'space_5_magic_trap_jaws',
    //'space_6_magic_blink',
    //'space_7_magic_shackles',
    //'space_8_magic_carapace',
    //'space_9_magic_impending_fate',
];

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function spell() {
    const blackList = [
        '~kara_',
        '_special.wiki',
        'astral_summon',
        'bonus_magic_kill_summon',
        'neutral_1_magic_back_to_garrison',
        'neutral_1_magic_mana_transfer',
        'night_bonus_magic_1_magic',
        'primal_bonus_magic_1_magic',
    ];
    let spells = getTranslations('/Spell~', 'spell', new RegExp(blackList.join('|')));
    const fileNames = suggestFileNames(spells);
    // const ids = spells.map((item) => item.target_id);

    spells = spells.filter((item) => IDS.includes(item.target_id));

    const fatSpells = fattenSpells(spells);

    const payloads = generatePayloads({
        items: fatSpells,
        fileNames,
        languages: TARGET_LANGUAGES,
        translations: TRANSLATIONS,
        handleFresh: handleFreshSpell,
        handleOld: handleOldSpell,
    });
    // console.log('payloads:', payloads);

    for (const {path, content} of payloads) {
        content && fs.writeFileSync(path, content);
    }
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await spell();
