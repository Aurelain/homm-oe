import fs from 'node:fs';
import getCsrfToken from './helpers/getCsrfToken.js';
import requestFromApi from './helpers/requestFromApi.js';
import inferPageTitle from './helpers/inferPageTitle.js';
import {TARGET} from './volatile/TARGET.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function setWiki() {
    const csrfToken = await getCsrfToken();

    const pageTitle = inferPageTitle();
    console.log(`Uploading content for: ${pageTitle}...`);
    const editRes = await requestFromApi(
        {
            action: 'edit',
            title: pageTitle,
            text: fs.readFileSync(TARGET, 'utf8'),
            token: csrfToken,
            bot: true, // Flags the edit as a bot to avoid clogging recent changes
        },
        'POST',
    );

    if (editRes.edit && editRes.edit.result === 'Success') {
        console.log('✅ Upload complete!');
    } else {
        console.error('❌ Edit failed:', editRes);
    }
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await setWiki();
