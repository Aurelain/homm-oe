import {unzipSync} from 'fflate';
import {readFileSync} from 'fs';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const OE_ZIP_PATH =
    '/home/aurelain/.steam/debian-installation/steamapps/common/' +
    'Heroes of Might and Magic Olden Era/HeroesOldenEra_Data/StreamingAssets/Core.zip';
const CHANCES_FILE_PATTERN = /^DB\/heroes_skills\/skills_by_level_tables\/[^_]+.[^_]+_skills_table\.json/;
const decoder = new TextDecoder();

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function computeSkillChances() {
    const zipBuffer = readFileSync(OE_ZIP_PATH);
    const zipHub = unzipSync(zipBuffer);

    const chances = collectChances(zipHub);
    console.log('chances:', chances);
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 * @param hub
 */
function collectChances(hub) {
    for (const key in hub) {
        if (key.match(CHANCES_FILE_PATTERN)) {
            const fileData = hub[key];
            const str = decoder.decode(fileData);
            const obj = JSON.parse(str).array[0].id;
            console.log('obj:', obj);
        }
    }
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
process.argv.join('').includes('compute-skill-chances') && computeSkillChances();
export default computeSkillChances;
