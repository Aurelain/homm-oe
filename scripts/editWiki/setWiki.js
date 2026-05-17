import fs from 'node:fs';
import getCsrfToken from './helpers/getCsrfToken.js';
import requestFromApi from './helpers/requestFromApi.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function setWiki() {
    try {
        const csrfToken = await getCsrfToken();
        const editRes = await requestFromApi(
            {
                action: 'edit',
                title: '',
                text: fileContent,
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
    } catch (error) {
        console.error('Script failed:', error.message);
    }
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await setWiki();
