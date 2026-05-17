import {TARGET} from '../volatile/TARGET.js';

/**
 *
 */
function inferPageTitle() {
    let pageTitle = TARGET;
    pageTitle = pageTitle.replace(/.*?wiki\//, ''); // remove prefix path
    pageTitle = pageTitle.replace(/\.\w+$/, ''); // remove extension
    pageTitle = pageTitle.replace(/#/, ':'); // replace the hash with colon
    pageTitle = pageTitle.replace(/~/, '/'); // replace the tilde with slash
    return pageTitle;
}

export default inferPageTitle;
