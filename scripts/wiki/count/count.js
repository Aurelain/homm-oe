import {writeOds} from 'hucre';
import walk from '../../utils/walk.js';
import {WIKI_DIR} from '../SETTINGS.js';
import fs from 'node:fs';
import match from '../../utils/match.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
async function count() {
    const pathToContent = getObeliskOutput();
    const pathToDefs = countDefs(pathToContent);
    const pathToConsolidated = consolidate(pathToDefs);
    const clean = removeItemsWithNoDefs(pathToConsolidated);
    const matrix = generateMatrix(clean);
    await printGrid(matrix, 'matrix.ods');
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function getObeliskOutput() {
    const dataDir = WIKI_DIR + '/Data/';
    const paths = walk(dataDir);
    const hub = {};
    for (const path of paths) {
        if (!path.includes('json')) {
            const content = fs.readFileSync(path, 'utf8');
            let short = path.substring(dataDir.length + 1);
            short = short.replace(/.wiki$/, '');
            hub[short] = content;
        }
    }
    return hub;
}

/**
 *
 */
function countDefs(pathToContent) {
    const hub = {};
    for (const path in pathToContent) {
        const content = pathToContent[path];
        const found = match(content, /^\{\{(\w+)Def\n/gm);
        const defCounts = {};
        for (const def of found) {
            const name = def[1];
            defCounts[name] = defCounts[name] || 0;
            defCounts[name]++;
        }
        hub[path] = defCounts;
    }
    return hub;
}

/**
 *
 */
function consolidate(pathToDefs) {
    const hub = {};
    for (const path in pathToDefs) {
        const [domain, page] = path.split('~');
        const name = page ? domain + '/*' : domain;
        hub[name] = hub[name] || {_files: 0, _defs: 0};
        const info = hub[name];
        info._files++;
        let total = 0;
        const defs = pathToDefs[path];
        for (const key in defs) {
            info[key] = info[key] || 0;
            info[key] += defs[key];
            total += defs[key];
        }
        info._defs += total;
    }
    return hub;
}

/**
 *
 */
function removeItemsWithNoDefs(pathToConsolidated) {
    const hub = {};
    for (const path in pathToConsolidated) {
        const info = pathToConsolidated[path];
        if (info._defs) {
            hub[path] = info;
        }
    }
    return hub;
}

/**
 *
 */
function generateMatrix(pathToConsolidated) {
    const allDefs = {};
    for (const path in pathToConsolidated) {
        Object.assign(allDefs, pathToConsolidated[path]);
    }
    const rowNames = Object.keys(pathToConsolidated).sort(compare);
    const columnNames = Object.keys(allDefs).sort(compare);
    const matrix = [['File', ...columnNames]];
    for (const rowName of rowNames) {
        const row = [rowName];
        const consolidated = pathToConsolidated[rowName];
        for (const columnName of columnNames) {
            row.push(consolidated[columnName] || 0);
        }
        matrix.push(row);
    }
    return matrix;
}

/**
 *
 */
function compare(a, b) {
    const aStarts = a.startsWith('_');
    const bStarts = b.startsWith('_');

    // If one starts with '_' and the other doesn't, put the '_' item first
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // Otherwise, fallback to natural alphabetical sorting
    return a.localeCompare(b);
}

/**
 *
 */
async function printGrid(grid, filename = 'output.ods') {
    const buffer = await writeOds({
        sheets: [
            {
                rows: grid,
            },
        ],
    });
    fs.writeFileSync(filename, buffer);
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
await count();
