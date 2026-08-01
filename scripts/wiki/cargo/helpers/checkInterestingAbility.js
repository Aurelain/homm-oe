// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function checkInterestingAbility(name) {
    if (name.startsWith('base_class_')) {
        return false;
    }
    if (name.startsWith('base_passive_flyer_') || name.startsWith('base_passive_blink_')) {
        return false;
    }
    if (name.match(/base_passive_[a-z]+_attack_/)) {
        return false;
    }
    // This is interesting...
    return true;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default checkInterestingAbility;
