import convertFileNameToWikiUrl from './convertFileNameToWikiUrl.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildLoc({lang, fileNameX, fileNameXRobotic}) {
    if (lang === 'en') {
        return '{{Loc}}';
    }
    const title = generateTitle(fileNameX);
    const url = convertFileNameToWikiUrl(fileNameXRobotic);
    return `{{Loc|${title}|link=${url}}}`;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function generateTitle(fileNameX) {
    let title = fileNameX;
    title = title.replace('.wiki', '');
    title = title.replace(/\(\w\w\)$/, ''); // remove simple language code
    title = title.replace(/\(\w\w_\w\w\)$/, ''); // remove advanced language code
    title = title.replace(/~\w+$/, ''); // remove any robotic leftovers
    title = title.replaceAll('_', ' ');
    title = title.trim();
    return title;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildLoc;
