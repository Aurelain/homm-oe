import {spawn} from 'node:child_process';
import {join} from 'node:path';

const EXTERNAL_SCRIPT = join(import.meta.dirname, '../../../mirror-wiki/scripts/sync/sync.js');
const SETTINGS_PATH = join(import.meta.dirname, '../../WIKI.json');

function sync() {
    const uploadParameter = process.argv[2] === 'upload' ? 'upload' : null;
    const child = spawn('node', [EXTERNAL_SCRIPT, SETTINGS_PATH, uploadParameter], {stdio: 'inherit'});
    child.on('close', (code) => process.exit(code));
}

sync();
