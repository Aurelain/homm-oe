import fs from 'node:fs';
import path from 'node:path';
import {unzipSync} from 'fflate';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const OE_ZIP_PATH =
    '/home/aurelain/.steam/debian-installation/steamapps/common' +
    '/Heroes of Might and Magic Olden Era/HeroesOldenEra_Data/StreamingAssets/Core.zip';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const unzipCore = (outputDirPath = '') => {
    const buffer = fs.readFileSync(OE_ZIP_PATH);
    const unzipped = unzipSync(buffer);
    if (!outputDirPath) {
        return unzipped;
    }

    for (const [filePath, fileData] of Object.entries(unzipped)) {
        const fullPath = path.join(outputDirPath, filePath);
        if (filePath.endsWith('/')) {
            fs.mkdirSync(fullPath, {recursive: true});
            continue;
        }
        fs.mkdirSync(path.dirname(fullPath), {recursive: true});
        fs.writeFileSync(fullPath, fileData);
    }

    return unzipped;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default unzipCore;
