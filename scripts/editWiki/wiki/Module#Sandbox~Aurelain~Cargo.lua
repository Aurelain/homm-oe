local p = {}
local FACTION_ORDER = {
    human = 1,
    undead = 2,
    nature = 3,
    demon = 4,
    unfrozen = 5,
    dungeon = 6,
    neutral = 7,
}
local FACTION_IDS_IN_TRANSLATION = {
    'human',
    'undead',
    'nature',
    'demon',
    'unfrozen',
    'dungeon',
    'neutral', -- missing
}
local OTHER_IDS_IN_TRANSLATION = {
    'creature',
    'faction',
    'tier',
    'cost', -- missing
    'hp',
    'offence',
    'defence',
    'damage',
    'initiative',
    'speed',
    'ranged',
}
local RESOURCE_ICONS = {
    wood_cost     = 'Wood',
    ore_cost      = 'Ore',
    mercury_cost  = 'Mercury',
    dust_cost     = 'Dust',
    crystal_cost  = 'Crystal',
    gemstone_cost = 'Gemstones'
}
local STAT_ICONS = {
    hp          = 'Icon_Stats_Health',
    offence     = 'Icon_Stats_Attack',
    defence     = 'Icon_Stats_Defence',
    damage      = 'Icon_Stats_Damage',
    initiative  = 'Icon_Stats_Initiative',
    speed       = 'Icon_Stats_Speed',
}
local ATTACK_RANKS = {
    base_passive_melee_attack_name = 1,                 -- Swordsman     100,   0,   0,   0,   0,   0,   0,   0,   0
    base_passive_melee_attack_no_counter_name = 2,      -- Vampire Lord  101,   0,   0,   0,   0,   0,   0,   0,   0
    base_passive_remote_attack_name = 3,                -- Graverobber     0, 100,   0,   0,   0,   0,   0,   0,   0
    base_passive_ranged_attack_name = 4,                -- Onyx Dancer    50, 100, 100,  90,  80,  70,  60,  50,  50
    base_passive_ranged_attack_no_close_name = 5,       -- Faun          100, 100, 100,  90,  80,  70,  60,  50,  50
    base_passive_ranged_attack_no_range_name = 6,       -- Marksman       50, 100, 100, 100, 100, 100, 100, 100, 100
    base_passive_ranged_attack_no_range_close_name = 7, -- Archangel     100, 100, 100, 100, 100, 100, 100, 100, 100
}
local ATTACK_ICONS = {
    base_passive_melee_attack_name = 'Base_passive_melee_attack',
    base_passive_melee_attack_no_counter_name = 'Base_passive_noncounter',
    base_passive_remote_attack_name = 'Base_passive_remote_attack',
    base_passive_ranged_attack_name = 'Base_passive_ranged_attack',
    base_passive_ranged_attack_no_close_name = 'Base_passive_ranged_attack', -- duplicate, needs a better icon
    base_passive_ranged_attack_no_range_name = 'Base_passive_sharpshooter',
    base_passive_ranged_attack_no_range_close_name = 'Base_passive_sharpshooter', -- duplicate, needs a better icon
}
local ROMAN = { 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII' }

------------------------------------------------------------------------------------------------------------------------
-- Detects the current language from the URL
------------------------------------------------------------------------------------------------------------------------
local function getCurrentLang()
    local title = mw.title.getCurrentTitle()
    local segments = mw.text.split(title.text, '/')
    for i = #segments, 2, -1 do
        local segment = mw.ustring.lower(segments[i])
        if mw.language.isSupportedLanguage(segment) then
            return segment
        end
    end
    return 'en'
end

------------------------------------------------------------------------------------------------------------------------
-- Awards a number from 0 to 3 for a unit, based on how upgraded it is
------------------------------------------------------------------------------------------------------------------------
local function computeUpgradeRank(row)
    local base = (row['base'] and row['base'] ~= "") and 1 or 0
    local upgrade = (row['upgrade'] and row['upgrade'] ~= "") and 10 or 0
    local sum = base + upgrade
    if sum == 1 then
        return 3
    elseif sum == 10 then
        return 1
    elseif sum == 0 then
        return 0
    else
        return 2
    end
end

------------------------------------------------------------------------------------------------------------------------
-- Returns one of the ATTACK_RANKS keys (e.g. 'base_passive_melee_attack_name') or an empty string
------------------------------------------------------------------------------------------------------------------------
local function computeAttackType(row)
    local abilities = row['shared_abilities']
    if type(abilities) ~= "string" then
        return ""
    end
    for key, _ in pairs(ATTACK_RANKS) do
        local pattern = "%f[%w]" .. key .. "%f[%W]"
        if string.match(abilities, pattern) then
            return key
        end
    end
    return ""
end

------------------------------------------------------------------------------------------------------------------------
-- Returns a rich wikitext with numbers and icons
------------------------------------------------------------------------------------------------------------------------
local function computeCost(row)
    local gold = row['gold_cost']
    local cost = gold .. '[[File:Icon_Resource_Gold.png|24px|link=]]'
    for key, icon in pairs(RESOURCE_ICONS) do
        local val = row[key]
        if val and val ~= '' and val ~= 0 then
            cost = cost .. ' ' .. val .. '[[File:Icon_Resource_' .. icon .. '.png|24px|link=]]'
        end
    end
    return cost
end

------------------------------------------------------------------------------------------------------------------------
-- Retrieves the data from Cargo
------------------------------------------------------------------------------------------------------------------------
local function query(lang)
    local tables = 'Unit, Translation'
    local fields = '' ..
        'Unit.id=id, ' ..
        'Unit.faction=faction, ' ..
        'Unit.tier=tier, ' ..
        'Unit.hp=hp, ' ..
        'Unit.offence=offence, ' ..
        'Unit.defence=defence, ' ..
        'Unit.damage_min=damage_min, ' ..
        'Unit.damage_max=damage_max, ' ..
        'Unit.initiative=initiative, ' ..
        'Unit.speed=speed, ' ..
        'Unit.shared_abilities=shared_abilities, ' .. -- we use it for range detection
        -- costs
        'Unit.gold_cost=gold_cost, ' ..
        'Unit.wood_cost=wood_cost, ' ..
        'Unit.ore_cost=ore_cost, ' ..
        'Unit.mercury_cost=mercury_cost, ' ..
        'Unit.dust_cost=dust_cost, ' ..
        'Unit.crystal_cost=crystal_cost, ' ..
        'Unit.gemstone_cost=gemstone_cost, ' ..
        -- upgrade
        'Unit.base_sid=base, ' ..
        'Unit.upgrade_sid=upgrade, ' ..
        -- Translation
        'Translation.language=language, ' ..
        'Translation.name=transName'

    -- Get BOTH the English row AND the target language row
    local cargoArgs = {
        join = 'Unit.id = Translation.target_id',
        where = 'Translation.language = "en" OR Translation.language = "' .. lang .. '"',
        orderBy = 'Unit.id ASC',
        limit = 1000 -- Increased limit since each unit will return 2 rows
    }

    return mw.ext.cargo.query(tables, fields, cargoArgs)
end

------------------------------------------------------------------------------------------------------------------------
-- Scans the Cargo results and folds the EN and lang rows into a single row
------------------------------------------------------------------------------------------------------------------------
local function consolidateResults(results, lang)
    local units = {}
    for _, row in ipairs(results) do
        local id = row['id']

        -- If this is the first time seeing this id, set up its basic stats
        if not units[id] then
            units[id] = mw.clone(row)
            units[id].upgradeRank = computeUpgradeRank(row)
            units[id].attackType = computeAttackType(row)
            units[id].cost = computeCost(row)
        end

        -- Save the names based on which language row we are currently looping over
        if row['language'] == 'en' then
            units[id].nameEn = row['transName']
        end
        if row['language'] == lang then
            units[id].nameX = row['transName']
        end
    end

    -- Convert the Dictionary into an Array
    local unitsArray = {}
    for _, unitData in pairs(units) do
        table.insert(unitsArray, unitData)
    end

    return unitsArray
end

------------------------------------------------------------------------------------------------------------------------
-- Decides the order between two units, for sorting purposes.
------------------------------------------------------------------------------------------------------------------------
local function sortUnits(unitA, unitB)
    local rankA = FACTION_ORDER[unitA.faction] or 99
    local rankB = FACTION_ORDER[unitB.faction] or 99

    if rankA ~= rankB then
        return rankA < rankB
    end

    if unitA.tier ~= unitB.tier then
        return unitA.tier < unitB.tier
    end

    if unitA.upgradeRank ~= unitB.upgradeRank then
        return unitA.upgradeRank < unitB.upgradeRank
    end

    return unitA.hp < unitB.hp
end

------------------------------------------------------------------------------------------------------------------------
-- Retrieves the text for some specific ids from Cargo Translations.
------------------------------------------------------------------------------------------------------------------------
local function translateIds(ids, lang, where)
    -- Initialize
    local dictionary = {}
    for _, id in ipairs(ids) do
        dictionary[id] = id:gsub("^%l", string.upper)
    end

    -- Cargo
    local idListString = '"' .. table.concat(ids, '", "') .. '"'
    local tables = 'Translation'
    local fields = 'target_id, name'
    where = where or ''
    local cargoArgs = {
        where = 'target_id IN (' .. idListString .. ') AND language = "' .. lang .. '"' .. where,
        limit = 100
    }
    local results = mw.ext.cargo.query(tables, fields, cargoArgs)

    -- Update dictionary
    if results then
        for _, row in ipairs(results) do
            dictionary[row['target_id']] = row['name']
        end
    end
    return dictionary
end

------------------------------------------------------------------------------------------------------------------------
-- Displays a variable
------------------------------------------------------------------------------------------------------------------------
local function dump(target)
    return '<pre>' .. mw.dumpObject(target) .. '</pre>'
end

------------------------------------------------------------------------------------------------------------------------
-- Builds an icon+text combo for the unit's name
------------------------------------------------------------------------------------------------------------------------
local function renderUnitName(u, suffix)
    local page = u.nameEn .. suffix
    local img = '[[File:' .. u.nameEn .. ' icon.png|40px|link=' .. page .. ']]'
    local text = '[[' .. page .. '|' .. u.nameX .. ']]'
    return img .. ' ' .. text
end

------------------------------------------------------------------------------------------------------------------------
-- Boilerplate for the header cells
------------------------------------------------------------------------------------------------------------------------
local function createTh(tr, text)
    tr:tag('th'):wikitext(text):done()
end

------------------------------------------------------------------------------------------------------------------------
-- Boilerplate for stat tds
------------------------------------------------------------------------------------------------------------------------
local function createStat(tr, value, pngName)
    tr:tag('td'):wikitext(value .. '[[File:' .. pngName .. '.png|16px|link=]]'):done()
end

------------------------------------------------------------------------------------------------------------------------
-- Main public function
------------------------------------------------------------------------------------------------------------------------
function p.display(frame)
    local lang = getCurrentLang()
    local suffix = lang ~= 'en' and '/' .. lang or ''
    local wordsEn = translateIds(OTHER_IDS_IN_TRANSLATION, 'en')
    local wordsX = lang == 'en' and wordsEn or translateIds(OTHER_IDS_IN_TRANSLATION, lang)
    local factionEn = translateIds(FACTION_IDS_IN_TRANSLATION, 'en', ' AND type="faction"')
    local factionX = lang == 'en' and factionEn or translateIds(FACTION_IDS_IN_TRANSLATION, lang, ' AND type="faction"')

    -- Cargo
    local results = query(lang)
    local units = consolidateResults(results, lang)
    table.sort(units, sortUnits)

    -- Table
    local htmlTable = mw.html.create('table')
    htmlTable:addClass('wikitable sortable')
    htmlTable:css('white-space', 'nowrap')

    -- Header
    local header = htmlTable:tag('tr')
    createTh(header, wordsX.creature)
    createTh(header, wordsX.faction)
    createTh(header, wordsX.tier)
    createTh(header, wordsX.cost)
    -- main stats
    createTh(header, '[[File:' .. STAT_ICONS.hp .. '.png|24px|' .. wordsX.hp .. ']]')
    createTh(header, '[[File:' .. STAT_ICONS.offence .. '.png|24px|' .. wordsX.offence .. ']]')
    createTh(header, '[[File:' .. STAT_ICONS.defence .. '.png|24px|' .. wordsX.defence .. ']]')
    createTh(header, '[[File:' .. STAT_ICONS.damage .. '.png|24px|' .. wordsX.damage .. ']]')
    createTh(header, '[[File:' .. STAT_ICONS.initiative .. '.png|24px|' .. wordsX.initiative .. ']]')
    createTh(header, '[[File:' .. STAT_ICONS.speed .. '.png|24px|' .. wordsX.speed .. ']]')
    -- others
    createTh(header, '[[File:Base_passive_ranged_attack.png|24px|' .. wordsX.ranged .. ']]')

    -- Body
    for _, u in ipairs(units) do
        local factionPage = factionEn[u.faction] .. '_Units' .. suffix
        local tr = htmlTable:tag('tr')
        tr:tag('td'):wikitext(renderUnitName(u, suffix)):done()
        tr:tag('td'):wikitext('[[' .. factionPage .. '|' .. factionX[u.faction] .. ']]'):done()
        tr:tag('td'):wikitext(ROMAN[tonumber(u.tier)]):done()
        -- cost
        tr:tag('td'):attr('data-sort-value', string.match(u.cost, "^%d+")):wikitext(u.cost):done()
        -- main stats
        createStat(tr, u.hp, STAT_ICONS.hp)
        createStat(tr, u.offence, STAT_ICONS.offence)
        createStat(tr, u.defence, STAT_ICONS.defence)
        createStat(tr, u.damage_min .. '-' .. u.damage_max, STAT_ICONS.damage)
        createStat(tr, u.initiative, STAT_ICONS.initiative)
        createStat(tr, u.speed, STAT_ICONS.speed)
        -- others
        local icon =  '[[File:' .. ATTACK_ICONS[u.attackType] .. '.png|32px' .. ']]'
        tr:tag('td'):attr('data-sort-value', ATTACK_RANKS[u.attackType]):wikitext(icon):done()
    end

    local styleTag = frame:extensionTag('templatestyles', '', { src = frame:getTitle() .. '/styles.css' })
    return styleTag .. tostring(htmlTable)
end

return p
