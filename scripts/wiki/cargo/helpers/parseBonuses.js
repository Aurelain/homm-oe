import add from './add.js';

/**
 *
 */
function parseBonuses(target, parentType) {
    const output = [];
    for (let i = 0; i < target.bonuses?.length; i++) {
        const bonus = target.bonuses[i];
        const def = {_type: 'BonusDef'};
        add(def, 'parent_type', parentType);
        add(def, 'parent_id', target.id);
        add(def, 'ordinal', i);
        add(def, 'type', bonus.type);
        add(def, 'parameters', bonus.parameters);
        add(def, 'battle_type', bonus.battleType);
        add(def, 'activation_level', bonus.activationLevel);
        add(def, 'receiver_role', bonus.receiverRole);
        add(def, 'upgrade_increment', bonus.upgrade?.increment);
        add(def, 'upgrade_level_step', bonus.upgrade?.levelStep);
        add(def, 'receivers', bonus.receivers);
        add(def, 'receiver_allegiance', bonus.receiverAllegiance);
        add(def, 'action_area', bonus.actionArea);
        add(def, 'fraction', bonus.fraction);
        if ('upgrade_increment' in def) {
            if (!String(def.upgrade_increment).includes('.')) {
                def.upgrade_increment += '.0';
            }
        }
        output.push(def);
    }
    return output;
}

export default parseBonuses;
