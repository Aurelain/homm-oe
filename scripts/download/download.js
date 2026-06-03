import {spawn} from 'node:child_process';
import {join} from 'node:path';

const EXTERNAL_SCRIPT = join(import.meta.dirname, '../../../mirror-wiki/scripts/download/download.js');
const SETTINGS_PATH = join(import.meta.dirname, '../../WIKI.json');

function download() {
    const child = spawn('node', [EXTERNAL_SCRIPT, SETTINGS_PATH], {stdio: 'inherit'});
    child.on('close', (code) => process.exit(code));
}

download();
