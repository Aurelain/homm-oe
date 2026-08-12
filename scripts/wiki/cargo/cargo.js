import unzipCore from '../../helpers/unzipCore.js';
import {WIKI_DIR} from '../SETTINGS.js';
import {buildCache} from './helpers/translate.js';
import fs from 'node:fs';
import assume from '../../utils/assume.js';
// Parsers:
import Artifact from './Artifact.js';
import AstrologistEvent from './AstrologistEvent.js';
import AttackArchetype from './AttackArchetype.js';
import AttackPassive from './AttackPassive.js';
import Building from './Building.js';
import CreatureType from './CreatureType.js';
import Difficulty from './Difficulty.js';
import Faction from './Faction.js';
import Hero from './Hero.js';
import HeroClass from './HeroClass.js';
import HeroSpecialization from './HeroSpecialization.js';
import HeroStat from './HeroStat.js';
import HeroSubClass from './HeroSubClass.js';
import ItemSet from './ItemSet.js';
import Law from './Law.js';
import MapObject from './MapObject.js';
import Movement from './Movement.js';
import Resource from './Resource.js';
import Skill from './Skill.js';
import SkillRollBand from './SkillRollBand.js';
import SkillRollReplacement from './SkillRollReplacement.js';
import SkillRollTable from './SkillRollTable.js';
import Spell from './Spell.js';
import StatBonusRoll from './StatBonusRoll.js';
import UI from './UI.js';
import UiLabel from './UiLabel.js';
import Unit from './Unit.js';
import UnitLabels from './UnitLabels.js';
import UnitShared from './UnitShared.js';
import UnitStat from './UnitStat.js';

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const DEBUG = new Set([
    // -- Use this to focus on only some parsers:
    SkillRollReplacement,
]);

const PARSERS = [
    Artifact,
    AstrologistEvent,
    AttackArchetype,
    AttackPassive,
    Building,
    CreatureType,
    Difficulty,
    Faction,
    Hero,
    HeroClass,
    HeroSpecialization,
    HeroStat,
    HeroSubClass,
    ItemSet,
    Law,
    MapObject,
    Movement,
    Resource,
    Skill,
    SkillRollBand,
    SkillRollReplacement,
    SkillRollTable,
    Spell,
    StatBonusRoll,
    UI,
    UiLabel,
    Unit,
    UnitLabels,
    UnitShared,
    UnitStat,
];

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
function cargo() {
    const zipHub = unzipCore();
    buildCache(zipHub);

    const results = {};
    for (const parser of PARSERS) {
        if (!DEBUG.size || DEBUG.has(parser)) {
            Object.assign(results, parser(zipHub));
        }
    }

    for (const key in results) {
        const path = WIKI_DIR + '/Data/' + key + '.wiki';
        const content = prepareContent(results[key]);
        // console.log('========\n' + path + '\n' + content);
        fs.writeFileSync(path, content);
    }
}

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
function prepareContent(parsingResult) {
    const parts = [];
    parts.push(`<!-- Bot-managed page. Edit the source in obelisk-bot, not here. -->`);
    parsingResult.comment && parts.push(parsingResult.comment);
    for (const def of parsingResult) {
        parts.push(convertDefinitionToTemplate(def));
    }
    parts.push(`[[Category:Game Data Import]]`);
    return parts.join('\n\n').trim();
}

/**
 *
 */
function convertDefinitionToTemplate(definition) {
    const lines = [];
    lines.push(`{{${definition._type}`);
    delete definition._type; // mutation
    for (const key in definition) {
        lines.push(`| ${key.trim()} = ${convertValue(definition[key])}`);
    }
    lines.push('}}');
    return lines.join('\n');
}

/**
 *
 */
function convertValue(value) {
    switch (typeof value) {
        case 'boolean':
            return value ? 'yes' : 'no';
        case 'string':
            return value; // value.trim(); // TODO: restore trim
        case 'number':
            return value.toString();
        default:
            assume(Array.isArray(value), value, 'Unexpected type!');
            return value.join(',');
    }
}

// =====================================================================================================================
//  R U N
// =====================================================================================================================
cargo();
