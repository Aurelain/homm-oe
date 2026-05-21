import {API_URL} from '../SETTINGS.js';
import {CF_CLEARANCE, USER_AGENT} from '../volatile/CF.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const DEBUG = false;
// const DEBUG = true;
let cookies = `cf_clearance=${CF_CLEARANCE}`;

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 * Helps handle API requests and manage session cookies
 */
async function requestFromApi(params, method = 'GET', formData = null) {
    const url = new URL(API_URL);
    const options = {
        method,
        headers: {
            Cookie: cookies,
            'User-Agent': USER_AGENT,
        },
    };

    const requestParams = {...params, format: 'json'};

    if (method === 'GET') {
        url.search = new URLSearchParams(requestParams);
    } else if (method === 'POST') {
        options.body = formData || new URLSearchParams(requestParams);
    }

    DEBUG && console.log(`Contacting API for ${previewText(JSON.stringify(params))}`);
    const response = await fetch(url, options);

    // Parse and store Set-Cookie headers for the session
    const setCookie = response.headers.getSetCookie();
    if (setCookie && setCookie.length > 0) {
        const newCookies = setCookie.map((c) => c.split(';')[0]).join('; ');
        cookies = cookies ? `${cookies}; ${newCookies}` : newCookies;
    }

    const text = await response.text();
    DEBUG && console.log(`    Response was: ${previewText(text)}`);

    return JSON.parse(text);
}

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function previewText(text) {
    return text.substring(0, 100).replaceAll(/\s/g, ' ');
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default requestFromApi;
