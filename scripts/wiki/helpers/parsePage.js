import match from '../../utils/match.js';
// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================

/**
 *
 */
function parsePage(content) {
    content = content.trim();
    let header = match(content, /^([\s\S]*?)==/)[1];
    if (header === undefined) {
        header = match(content, /^([\s\S]*?)\n\n/)[1];
        if (header === undefined) {
            header = '';
        }
    }
    let rest = content.substring(header.length);

    let footer = '';
    const footerSeparatorIndex = rest.lastIndexOf('\n\n');
    if (footerSeparatorIndex < 0) {
        footer = rest;
        rest = '';
    } else {
        footer = rest.substring(footerSeparatorIndex + 2);
        rest = rest.substring(0, footerSeparatorIndex);
    }

    return {
        header: header.trim(),
        sections: parseSection(rest),
        ids: parseIds(rest),
        footer: footer.trim(),
    };
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function parseSection(text) {
    let draft = text + '§';
    draft = draft.replace(/==+ *(.*?)==/g, '§$1¶');
    const sections = draft.split('§');
    const output = {};
    for (const section of sections) {
        let [title = '', body = ''] = section.split('¶');
        title = title.trim();
        body = body.trim();
        if (title || body) {
            output[title] = body;
        }
    }
    return output;
}

/**
 *
 */
function parseIds(text) {
    const found = match(text, /\|\s*id\s*=\s*(\w+)[\s\S]*?}}([^{=]*)/g);
    const output = {};
    for (const pair of found) {
        const id = pair[1].trim();
        const extra = pair[2].trim();
        if (id && extra) {
            output[id] = extra;
        }
    }
    return output;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default parsePage;
