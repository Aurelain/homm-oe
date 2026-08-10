import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import parseBonuses from './helpers/parseBonuses.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    'ambassadors_word_ambassadors_sash_artifact',
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
    // patch(artifact);
    addUpgradeIncrement(artifact);

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
    add(def, 'source_path', path);

    const currentItem = {
        level: 1,
        config: artifact,
    };
    const translationDefs = translate([
        {
            target_id: def.id,
            type: 'artifact',
            name: def.name_sid,
            description: def.description_sid,
            _data: {
                currentItem,
            },
        },
        {
            target_id: def.id,
            type: 'artifact_upgrade',
            description: def.upgrade_description_sid,
            _data: {
                currentItem,
            },
        },
        {
            target_id: def.id,
            type: 'artifact_narrative',
            description: def.narrative_description_sid,
            _data: {
                currentItem,
            },
        },
    ]);

    const bonusDefs = parseBonuses(artifact, 'artifact');

    return [def, ...translationDefs, ...bonusDefs];
}

/**
 *
 */
function addUpgradeIncrement(artifact) {
    if (!artifact.bonuses) {
        artifact.bonuses = [];
    }
    if (!artifact.bonuses[0]) {
        artifact.bonuses.push({});
    }
    if (!artifact.bonuses[0].upgrade) {
        artifact.bonuses[0].upgrade = {};
    }
    if (!artifact.bonuses[0].upgrade.hasOwnProperty('increment')) {
        artifact.bonuses[0].upgrade.increment = 1;
    }
    if (!artifact.bonuses[1]) {
        artifact.bonuses.push({});
    }
    if (!artifact.bonuses[1].upgrade) {
        artifact.bonuses[1].upgrade = {};
    }
    if (!artifact.bonuses[1].upgrade.hasOwnProperty('increment')) {
        artifact.bonuses[1].upgrade.increment = 1;
    }
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default Artifact;
