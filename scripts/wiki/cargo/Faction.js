import filterHub from '../../helpers/filterHub.js';
import add from './helpers/add.js';
import translate from './helpers/translate.js';
import match from '../../utils/match.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const IDS = new Set([
    // -- Test ids:
    // 'demon',
]);

const SIDES = {
    army: 1,
    faction: 0,
};

let cache;

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function Faction(zipHub) {
    if (cache) {
        return cache;
    }

    const output = {};

    const files = filterHub(zipHub, 'DB/fractions/');
    for (const path in files) {
        const fileContent = files[path];
        for (const item of fileContent) {
            const {id} = item;
            if (IDS.size && !IDS.has(id)) {
                continue;
            }
            // console.log('id:', id);
            output['Faction~' + id] = buildDefinitions(item, path);
        }
    }

    cache = output;
    return output;
}
// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function buildDefinitions(item, path) {
    const def = {_type: 'FactionDef'};
    add(def, 'id', item.id);
    add(def, 'icon', item.icon);
    add(def, 'icon_faction_laws', item.iconFractionLaws);
    add(def, 'biome', item.biome);
    add(def, 'resource', item.resourceName);
    add(def, 'name_sid', item.name);
    add(def, 'desc_sid', item.desc);
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: def.id,
        type: 'faction',
        name: def.name_sid,
        description: def.desc_sid,
        _data: {},
    });

    const cityDefs = [];
    for (const cityName of item.cityNames) {
        cityDefs.push(...buildCityDef(cityName));
    }

    const lawTierDefs = [];
    const lawTreeDefs = [];
    for (const [i, line] of item.fractionLawsLines.entries()) {
        lawTierDefs.push(...buildLawTierDef(line, i + 1, item.id));
        lawTreeDefs.push(...buildLawTreeDef(line.groups, i + 1, item.id));
    }

    return [def, ...translationDefs, ...cityDefs, ...lawTierDefs, ...lawTreeDefs];
}

/**
 *
 */
function buildCityDef(cityName) {
    const [, faction, nr] = match(cityName, /^([a-z]+)_.*?_(\d+)$/);
    const subtype = faction + '_' + nr;
    const def = {_type: 'EntryDef'};
    add(def, 'type', 'FactionCityName');
    add(def, 'subtype', subtype);
    add(def, 'name_sid', cityName);

    const translationDefs = translate({
        target_id: subtype,
        type: 'FactionCityName',
        subtype: subtype,
        name: def.name_sid,
    });

    return [def, ...translationDefs];
}

/**
 *
 */
function buildLawTierDef(line, tier, faction) {
    const def = {_type: 'FactionLawTierDef'};
    add(def, 'faction', faction);
    add(def, 'tier', tier);
    add(def, 'count_to_unlock', line.countToUnlock);
    return [def];
}

/**
 *
 */
function buildLawTreeDef(groups, tier, faction) {
    const output = [];
    for (const side in SIDES) {
        const i = SIDES[side];
        for (const [slot, id] of groups[i].laws.entries()) {
            const def = {_type: 'LawTreePositionDef'};
            add(def, 'faction', faction);
            add(def, 'tier', tier);
            add(def, 'side', side);
            add(def, 'slot', slot);
            add(def, 'law_id', id);
            output.push(def);
        }
    }
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default Faction;
