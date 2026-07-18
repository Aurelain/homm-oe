import fs from 'node:fs';
import match from '../../utils/match.js';
import assume from '../../utils/assume.js';
import parseDefinition from '../helpers/parseDefinition.js';
import walk from '../../utils/walk.js';
import {WIKI_DIR} from '../SETTINGS.js';
import filter from '../../utils/filter.js';
import parseTranslationFile from '../helpers/parseTranslationFile.js';

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function fattenUnits(units) {
    const output = [];
    for (const unit of units) {
        const {path} = unit;

        const content = fs.readFileSync(path, 'utf8');
        const [unitDef] = match(content, /\{\{UnitDef[\s\S]*?}}/);
        const definition = parseDefinition(unitDef);

        const extra = {};
        // if (fs.existsSync(path.replace('.wiki', '_special.wiki'))) {
        // const {hero, fragment} = findMasterful(unit.name.en);
        // extra.masterfulHero = hero;
        // extra.masterfulFragment = fragment;
        // }

        output.push({
            ...definition,
            ...unit,
            ...extra,
        });
    }
    return output;
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function findMasterful(name) {
    name = name.replaceAll("'", '’'); // undo the fix by Ketura
    const dataPaths = walk(WIKI_DIR + '/Data');
    let paths = filter(dataPaths, '/HeroSpecialization~');
    paths = filter(paths, (path) => !path.match(/tutorial|campaign|cm_fun/));
    for (const path of paths) {
        const heroContent = fs.readFileSync(path, 'utf8');
        if (heroContent.includes(`starts with the “Masterful ${name}”`)) {
            const [, hero] = match(path, /~(.*?)_specialization/);
            const fragment = collectMasterfulFragments(path);
            return {hero, fragment};
        }
    }
    console.log(`Warning: Could not find masterful version of "${name}"!`);
    return {hero: '', fragment: {}};
}

/**
 *
 */
function collectMasterfulFragments(path) {
    const [heroSpec] = parseTranslationFile(path);
    const fragment = {};
    for (const lang in heroSpec.description) {
        const text = heroSpec.description[lang];
        const [, secondSentence] = match(text, /[.,。]\s*([^.。]+[.。])/);
        fragment[lang] = secondSentence;
    }
    return fragment;
}

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default fattenUnits;
