import joinLines from '../../utils/joinLines.js';
import buildLoc from '../helpers/buildLoc.js';
import buildInfoBox from './buildInfoBox.js';
import assume from '../../utils/assume.js';
import romanize from '../../utils/romanize.js';
import filterHub from '../../helpers/filterHub.js';

const EXISTING = 0;
const TEMPLATE = 1;
const VERBOSE = 2;
const METHOD = {
    en: EXISTING,
    'zh-hans': EXISTING,
    es: EXISTING,
    fr: EXISTING,
    pt_br: EXISTING,
    ru: TEMPLATE, //        1
    de: EXISTING,
    ja: EXISTING,
    tr: EXISTING,
    ko: EXISTING,
    it: EXISTING,
    'zh-hant': EXISTING,
    pl: VERBOSE, //         2
    uk: EXISTING,
    hu: EXISTING,
    cs: EXISTING,
};

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function buildHeader(info, translations, context, previousHeader) {
    const lines = [];
    lines.push(buildLoc(info));
    lines.push(buildInfoBox(info));

    switch (METHOD[info.lang]) {
        case EXISTING:
            if (previousHeader) {
                lines.push('');
                lines.push(previousHeader);
            }
            break;
        case TEMPLATE:
            lines.push('');
            lines.push(`{{UnitStinger|lang=${info.lang}|id=${info.id}}}`);
            break;
        case VERBOSE:
            lines.push('');
            lines.push(...buildVerbose(info, translations, context));
            break;
        default:
            assume(false, 'Unexpected method!');
    }
    return joinLines(lines);
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function buildVerbose(info, translations, context) {
    const lines = [];
    const {id, lang, faction, name, tier} = info;
    const baseId = id.replace('_upg', '').replace('_alt', '');
    const upgradeA = baseId + '_upg';
    const upgradeB = baseId + '_upg_alt';

    // First line:
    let main = translations.Stinger_main[lang];
    main = main.replace('#1', `'''${name[lang]}'''`);
    main = main.replace('#2', romanize(tier));
    main = main.replace('#3', `{{F|${faction}|${lang}}}`);

    // Dwelling:
    const dwellingId = findDwelling(info, context);
    if (dwellingId) {
        let text = translations.Stinger_dwelling[lang];
        text = text.replace('#1', `{{Link|id=${dwellingId}|lang=${lang}}}`);
        main += text;
    }
    lines.push(main);

    // Second line:
    if (faction !== 'neutral') {
        lines.push('');
        if (id === baseId) {
            let text = translations.Stinger_is_base[lang];
            text = text.replace('#1', `{{UnitLinkIcon|${upgradeA}|${lang}}}`);
            text = text.replace('#2', `{{UnitLinkIcon|${upgradeB}|${lang}}}`);
            lines.push(text);
        } else {
            let text = translations.Stinger_is_upgraded[lang];
            text = text.replace('#1', `{{UnitLinkIcon|${baseId}|${lang}}}`);
            const uid = id === upgradeA ? upgradeB : upgradeA;
            text = text.replace('#2', `{{UnitLinkIcon|${uid}|${lang}}}`);
            lines.push(text);
        }
    }

    return lines;
}

/**
 *
 */
function findDwelling({id, lang, faction, tier}, {zipHub}) {
    if (faction === 'neutral') {
        const barracks = filterHub(zipHub, 'barracks.json', null, true);
        for (const barrack of barracks) {
            if (barrack.unitsData.units[0].sids[0] === id) {
                return barrack.id;
            }
        }
        return null;
    } else {
        const level = id.includes('_upg') ? 2 : 1;
        return `${faction}_Build_Tier_${tier}_L${level}`;
    }
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default buildHeader;
