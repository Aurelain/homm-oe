import {API_URL} from '../SETTINGS.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
let cookies = '';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 * Helps handle API requests and manage session cookies
 */
async function requestFromApi(params, method = 'GET') {
    const url = new URL(API_URL);
    const options = {
        method,
        headers: {
            Cookie: cookies,
            'User-Agent': 'LocalWikiUploader/1.0 (Node.js)',
        },
    };

    const requestParams = {...params, format: 'json'};

    if (method === 'GET') {
        url.search = new URLSearchParams(requestParams);
    } else if (method === 'POST') {
        options.body = new URLSearchParams(requestParams);
    }

    const response = await fetch(url, options);

    // Parse and store Set-Cookie headers for the session
    const setCookie = response.headers.getSetCookie();
    if (setCookie && setCookie.length > 0) {
        const newCookies = setCookie.map((c) => c.split(';')[0]).join('; ');
        cookies = cookies ? `${cookies}; ${newCookies}` : newCookies;
    }

    return response.json();
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default requestFromApi;
