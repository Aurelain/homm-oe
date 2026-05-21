import fs from 'node:fs';
import path from 'node:path';
import {pipeline} from 'node:stream/promises';
import requestFromApi from './helpers/requestFromApi.js';
import {CF_CLEARANCE, USER_AGENT} from './volatile/CF.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const OUTPUT_DIR = import.meta.dirname + '/wiki/Files';
const OVERWRITE = false;

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function downloadFiles() {
    const fileUrls = await fetchAllFileUrls();

    !fs.existsSync(OUTPUT_DIR) && fs.mkdirSync(OUTPUT_DIR, {recursive: true});

    await downloadAllFiles(fileUrls);
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 * PHASE 1: Crawl the Wiki API to gather all available file metadata.
 * Sweeps through pagination and returns a flat array of { title, url } objects.
 */
async function fetchAllFileUrls() {
    console.log('🔍 Phase 1: Fetching file list from Wiki API...');
    const allFiles = [];
    let apiContinue = {};
    let hasNext = true;
    let batchCount = 1;

    while (hasNext) {
        console.log(`   Fetching file batch #${batchCount}...`);

        const queryParams = {
            action: 'query',
            generator: 'allpages',
            gapnamespace: '6', // Namespace 6 is 'File:'
            gaplimit: '500', // Max elements per request
            prop: 'imageinfo',
            iiprop: 'url',
            formatversion: '2',
            ...apiContinue,
        };

        // Adapting to your existing requestFromApi helper
        const response = await requestFromApi(queryParams, 'GET');

        if (response?.query?.pages) {
            for (const page of response.query.pages) {
                // Ensure the file page actually contains a target asset URL
                if (page.imageinfo && page.imageinfo.length > 0) {
                    allFiles.push({
                        title: page.title,
                        url: page.imageinfo[0].url,
                    });
                } else {
                    console.log(`   ⚠️ Skipping metadata for ${page.title} (No source URL found)`);
                }
            }
        }

        // Check if there are more records to grab
        if (response.continue) {
            apiContinue = response.continue;
            batchCount++;
        } else {
            hasNext = false;
        }
    }

    console.log(`✅ Phase 1 Complete. Found ${allFiles.length} total files to download.\n`);
    return allFiles;
}

/**
 * PHASE 2: Loop through our complete array and download the items to disk.
 */
async function downloadAllFiles(fileList) {
    const {length} = fileList;
    console.log(`📥 Phase 2: Starting batch download of ${length} files...`);
    let successfulDownloads = 0;

    for (let i = 0; i < length; i++) {
        const file = fileList[i];

        // Clean up the namespace prefix and spaces for a valid filename
        const fileName = file.title.replace(/^File:/i, '').replace(/[\s]/g, '_');
        const targetPath = path.join(OUTPUT_DIR, fileName);
        if (fs.existsSync(targetPath) && !OVERWRITE) {
            console.log(`   [${i + 1}/${length}] Skipping ${fileName}`);
            continue;
        }

        console.log(`   [${i + 1}/${length}] Downloading: ${fileName}...`);

        try {
            await downloadBinaryFile(file.url, targetPath);
            successfulDownloads++;
        } catch (downloadError) {
            console.error(`   ❌ Failed to download ${fileName}:`, downloadError.message);
        }
    }

    console.log(`\n✅ Phase 2 Complete! Successfully downloaded ${successfulDownloads} files to ${OUTPUT_DIR}`);
}

/**
 *
 */
async function downloadBinaryFile(fileUrl, targetPath) {
    const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {Cookie: `cf_clearance=${CF_CLEARANCE}`, 'User-Agent': USER_AGENT},
    });
    if (!response.ok) {
        throw new Error(`Server responded with status code ${response.status} ${response.statusText}`);
    }
    await pipeline(response.body, fs.createWriteStream(targetPath));
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await downloadFiles();
