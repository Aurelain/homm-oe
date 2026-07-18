// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildInfoBox({lang, id, masterfulFragment}, previousMasterful = '') {
    const masterfulText = previousMasterful || masterfulFragment?.[lang] || '';
    const masterful = masterfulFragment ? `|masterful=${masterfulText}` : '';
    return `{{Template:SpellInfobox|lang=${lang}|id=${id}${masterful}}}`;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildInfoBox;
