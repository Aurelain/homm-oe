import add from './add.js';
import translate from './translate.js';

/**
 *
 */
function parseEntries(entries, config) {
    config.prefix = config.prefix || '';
    config.name_suffix = config.name_suffix === undefined ? '_name' : config.name_suffix;
    config.desc_suffix = config.desc_suffix === undefined ? '_description' : config.desc_suffix;

    const {domain} = config;
    const output = {};

    for (const entry in entries) {
        const idCore = entries[entry] === true ? entry : entries[entry];
        output[domain + '~' + entry] = buildDefinitions(entry, idCore, config);
    }

    return output;
}

/**
 *
 */
function buildDefinitions(entry, idCore, config) {
    const def = {_type: 'EntryDef'};
    add(def, 'type', config.type);
    add(def, 'subtype', entry);
    add(def, 'name_sid', config.prefix + idCore + config.name_suffix);
    add(def, 'desc_sid', config.prefix + idCore + config.desc_suffix);
    add(def, 'source_path', config.path);

    const translationDefs = translate({
        target_id: def.subtype,
        type: def.type,
        subtype: def.subtype,
        name: def.name_sid,
        description: def.desc_sid,
    });

    return [def, ...translationDefs];
}

export default parseEntries;
