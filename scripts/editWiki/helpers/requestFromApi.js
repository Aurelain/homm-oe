import {API_URL} from '../SETTINGS.js';
import {CF_CLEARANCE, USER_AGENT} from '../volatile/CF.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const DEBUG = false;
// const DEBUG = true;
const cookieJar = new Map();
cookieJar.set('cf_clearance', CF_CLEARANCE);

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
            Cookie: getCookies(),
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
    updateCookies(response);

    const text = await response.text();
    DEBUG && console.log(`    Response was: ${previewText(text)}`);

    return JSON.parse(text);
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function previewText(text) {
    return text.substring(0, 100).replaceAll(/\s/g, ' ');
}

/**
 *
 */
function getCookies() {
    return Array.from(cookieJar.entries())
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
}

/**
 *
 */
function updateCookies(response) {
    const cookiesList = response.headers.getSetCookie();
    if (cookiesList && cookiesList.length > 0) {
        cookiesList.forEach((cookieStr) => {
            const firstPart = cookieStr.split(';')[0];
            const separatorIndex = firstPart.indexOf('=');
            if (separatorIndex !== -1) {
                const key = firstPart.substring(0, separatorIndex).trim();
                const value = firstPart.substring(separatorIndex + 1).trim();
                cookieJar.set(key, value);
            }
        });
    }
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default requestFromApi;
