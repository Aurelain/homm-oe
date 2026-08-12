import add from './add.js';
import translate from './translate.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function parseEntries(entries, config) {
    const {domain} = config;
    const output = {};

    for (const entry in entries) {
        const adaptedConfig = adaptConfig(config, entry, entries[entry]);
        output[domain + '~' + entry] = buildDefinitions(entry, adaptedConfig);
    }

    return output;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function adaptConfig(config, entryKey, entryData) {
    const output = {
        prefix: '',
        name_suffix: '_name',
        desc_suffix: '_description',
    };
    Object.assign(output, config);
    if (entryData === true) {
        entryData = {id: entryKey};
    } else if (typeof entryData === 'string') {
        entryData = {id: entryData};
    }
    Object.assign(output, entryData);
    return output;
}

/**
 *
 */
function buildDefinitions(entry, config) {
    const {type, id, prefix, name_suffix, desc_suffix, suppressDescription, path, trimColon} = config;
    const def = {_type: 'EntryDef'};
    add(def, 'type', type);
    add(def, 'subtype', entry);
    add(def, 'name_sid', prefix + id + name_suffix);
    add(def, 'desc_sid', suppressDescription ? undefined : prefix + id + desc_suffix);
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: def.subtype,
        type: def.type,
        subtype: def.subtype,
        name: def.name_sid,
        description: def.desc_sid,
    });

    if (trimColon) {
        for (const def of translationDefs) {
            if (def.name) {
                def.name = def.name.replace(/[:：\s]*$/, '');
            }
            if (def.description) {
                def.description = def.description.replace(/[:：\s]*$/, '');
            }
        }
    }

    return [def, ...translationDefs];
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default parseEntries;
