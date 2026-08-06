import fs from 'node:fs';
import path from 'node:path';
import requestFromApi from './helpers/requestFromApi.js';
import getCsrfToken from './helpers/getCsrfToken.js';
import sleep from '../utils/sleep.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
// const DRY_RUN = true;
const DRY_RUN = false;

const UPLOAD_SRC_DIR = import.meta.dirname + '/upload';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function uploadFiles() {
    const files = fs.readdirSync(UPLOAD_SRC_DIR).filter((file) => {
        return !file.startsWith('.');
    });

    if (files.length === 0) {
        console.log('No files found to upload.');
        return;
    }
    files.sort();

    console.log(`🚀 Found ${files.length} files to upload. Fetching CSRF Token...`);
    const csrfToken = DRY_RUN ? null : await getCsrfToken();

    for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        const localPath = path.join(UPLOAD_SRC_DIR, fileName);
        let wikiFilename = fileName.replace(/_/g, ' ');
        wikiFilename = fileName.replace('_name.png', '.png').replace('_name_', '_');
        wikiFilename = wikiFilename.substring(0, 1).toUpperCase() + wikiFilename.substring(1);

        const action = DRY_RUN ? 'Testing' : 'Uploading';
        console.log(`   [${i + 1}/${files.length}] ${action}: ${wikiFilename}...`);

        try {
            const fileBuffer = fs.readFileSync(localPath);
            const fileBlob = new Blob([fileBuffer]);

            // FormData
            const formData = new FormData();
            formData.append('action', 'upload');
            formData.append('filename', wikiFilename);
            formData.append('token', csrfToken);
            formData.append('file', fileBlob, wikiFilename); // Key must be named 'file'
            formData.append('ignorewarnings', '1'); // Overwrites file if it already exists
            formData.append('format', 'json');

            // Text
            const text = getCategories(wikiFilename);
            formData.append('text', text);
            formData.append('comment', text);
            if (DRY_RUN) {
                console.log(text);
                continue;
            }

            const result = await requestFromApi({}, 'POST', formData);

            if (result.upload && result.upload.result === 'Success') {
                console.log(`   ✅ Success! Target Page: ${result.upload.filename}`);
            } else if (result.error) {
                console.error(`   ❌ API Error uploading ${fileName}:`, result.error.info);
            } else {
                console.error(`   ❌ Unexpected response layout for ${fileName}:`, result);
            }
        } catch (err) {
            console.error(`   ❌ Local system error reading/uploading ${fileName}:`, err.message);
        }

        await sleep(500);
    }

    console.log('\n🏁 Mass upload operation finalized.');
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function getCategories(fileName) {
    const categories = [];
    categories.push('Hero Elite Class Icons');
    const clothed = categories.map((category) => `[[Category:${category}]]`);
    return clothed.join(' ');
}
// =====================================================================================================================
//  R U N
// =====================================================================================================================
await uploadFiles();
