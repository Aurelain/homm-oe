import {PASSWORD, USERNAME} from '../SECRET.js';
import requestFromApi from './requestFromApi.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function getCsrfToken() {
    try {
        console.log('1. Fetching login token...');
        const tokenRes = await requestFromApi({action: 'query', meta: 'tokens', type: 'login'});
        const loginToken = tokenRes.query.tokens.logintoken;

        console.log('2. Authenticating...');
        const loginRes = await requestFromApi(
            {
                action: 'login',
                lgname: USERNAME,
                lgpassword: PASSWORD,
                lgtoken: loginToken,
            },
            'POST',
        );

        if (loginRes.login.result !== 'Success') {
            throw new Error(`Login failed: ${loginRes.login.reason}`);
        }

        console.log('3. Fetching CSRF edit token...');
        const csrfRes = await apiRequest({action: 'query', meta: 'tokens'});
        const csrfToken = csrfRes.query.tokens.csrftoken;
        return csrfToken;
    } catch (error) {
        console.error('Script failed:', error.message);
    }
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default getCsrfToken;
