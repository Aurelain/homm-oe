import fs from 'node:fs';
import requestFromApi from './helpers/requestFromApi.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function getWiki() {
    try {
        const PAGE_TITLE = 'Module:Sandbox/Aurelain/Cargo';
        console.log(`Fetching current content for: ${PAGE_TITLE}...`);
        const readRes = await requestFromApi(
            {
                action: 'query',
                prop: 'revisions',
                titles: PAGE_TITLE,
                rvprop: 'content',
                rvslots: 'main',
                formatversion: 2, // Returns a clean JSON array instead of dynamic page ID keys
            },
            'GET',
        );

        // Extract the content from the response
        const page = readRes.query.pages[0];

        if (page.missing) {
            console.error('❌ Page does not exist on the wiki.');
        } else {
            // Navigate the JSON tree to get the raw text
            const remoteContent = page.revisions[0].slots.main.content;
            console.log('remoteContent:', remoteContent);
            console.log('✅ Content downloaded successfully!');

            // Optional: Save it locally
            // fs.writeFileSync(FILE_PATH, remoteContent, 'utf-8');
        }
    } catch (error) {
        console.error('Script failed:', error.message);
    }
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await getWiki();
