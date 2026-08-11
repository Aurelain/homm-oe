import add from './add.js';
import translate from './translate.js';

/**
 *
 */
function parseEntries(entries, fileName, type, path) {
    const output = {};

    for (const entry in entries) {
        output[fileName + '~' + entry] = buildDefinitions(entry, type, path);
    }

    return output;
}

/**
 *
 */
function buildDefinitions(entry, type, path) {
    const def = {_type: 'EntryDef'};
    add(def, 'type', type);
    add(def, 'subtype', entry);
    add(def, 'name_sid', entry + '_name');
    add(def, 'desc_sid', entry + '_description');
    add(def, 'source_path', path);

    const translationDefs = translate({
        target_id: entry,
        type: type,
        subtype: entry,
        name: def.name_sid,
        description: def.desc_sid,
    });

    return [def, ...translationDefs];
}

export default parseEntries;
