import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import parseBonuses from './helpers/parseBonuses.js';
import cloneDeep from '../../utils/cloneDeep.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'enchanted_magic_scroll_artifact_day_1_magic_healing_water',
]);

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function Artifact(zipHub) {
    const output = {};

    const artifactFiles = filterHub(zipHub, 'DB/items/items/.*?json');
    for (const path in artifactFiles) {
        const artifacts = artifactFiles[path];
        for (const artifact of artifacts) {
            const {id} = artifact;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            // console.log('id:', id);
            output['Artifact~' + id] = buildArtifactDefinitions(artifact, path);
        }
    }

    return output;
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function buildArtifactDefinitions(artifact, path) {
    const def = {_type: 'ArtifactDef'};
    add(def, 'id', artifact.id);
    add(def, 'name_sid', artifact.name);
    add(def, 'description_sid', artifact.description);
    add(def, 'upgrade_description_sid', artifact.upgradeDescription);
    add(def, 'narrative_description_sid', artifact.narrativeDescription);
    add(def, 'icon', artifact.icon);
    add(def, 'slot', artifact.slot_);
    add(def, 'rarity', artifact.rarity);
    add(def, 'artifact_set_id', artifact.itemSet);
    add(def, 'goods_value', artifact.goodsValue);
    add(def, 'max_level', artifact.maxLevel);
    add(def, 'cost_base', artifact.costBase);
    add(def, 'cost_per_level', artifact.costPerLevel);
    add(def, 'reward_for_destroy', artifact.rewardForDestroy);
    add(def, 'is_special_item', !!artifact.isSpecialItem);
    add(def, 'use_expand_tooltip', getExpandTooltip(artifact));
    add(def, 'can_destroy', artifact.canDestroy);
    add(def, 'can_apply_bonus_always', artifact.canApplyBonusAlways);
    add(def, 'source_path', path);

    const CurrentItem = {
        level: 1,
        config: cloneConfig(artifact),
    };

    const translationDefs = translate([
        {
            target_id: def.id,
            type: 'artifact',
            name: def.name_sid,
            description: def.description_sid,
            _data: {
                CurrentItem,
            },
        },
        {
            target_id: def.id,
            type: 'artifact_upgrade',
            description: def.upgrade_description_sid,
            _data: {
                CurrentItem,
            },
        },
        {
            target_id: def.id,
            type: 'artifact_narrative',
            description: def.narrative_description_sid,
            _data: {
                CurrentItem,
            },
        },
    ]);

    const bonusDefs = parseBonuses(artifact, 'artifact');

    return [def, ...translationDefs, ...bonusDefs];
}

/**
 *
 */
function cloneConfig(config) {
    const clone = cloneDeep(config);
    if (!clone.bonuses) {
        clone.bonuses = [];
    }
    if (!clone.bonuses[0]) {
        clone.bonuses.push({});
    }
    if (!clone.bonuses[0].upgrade) {
        clone.bonuses[0].upgrade = {};
    }
    if (!clone.bonuses[0].upgrade.hasOwnProperty('increment')) {
        clone.bonuses[0].upgrade.increment = 1;
    }
    if (!clone.bonuses[1]) {
        clone.bonuses.push({});
    }
    if (!clone.bonuses[1].upgrade) {
        clone.bonuses[1].upgrade = {};
    }
    if (!clone.bonuses[1].upgrade.hasOwnProperty('increment')) {
        clone.bonuses[1].upgrade.increment = 1;
    }
    return clone;
}

/**
 *
 */
function getExpandTooltip(artifact) {
    const {useExpandTooltip} = artifact;
    if (useExpandTooltip) {
        return useExpandTooltip === 'true';
    }
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default Artifact;
