/**
 *
 */
function patch(target) {
    switch (target.id) {
        case 'arena_sub_skill_faction_unfrozen_2_old': // fall
        case 'campaign_sub_skill_faction_unfrozen_2_old': // fall
        case 'sub_skill_faction_unfrozen_2_old': // fall
        case 'campaign_sub_skill_protection_4_old': // fall
        case 'sub_skill_protection_4_old':
            target.bonuses[0].parameters.push(0);
            target.bonuses[0].parameters.push(0);
            break;
        case 'skill_summon_1_bonus': // fall
        case 'skill_summon_2_bonus': // fall
        case 'skill_summon_3_bonus':
            target.data.stats.hp = 0;
            break;
        case 'magic_shade_cloak_effect_0':
            target.data.stats.outAllDmgMod = 1;
            break;
    }
}

export default patch;
