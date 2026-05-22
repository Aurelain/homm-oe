-- Usage: {{#invoke:LawsOverview|display}}
local p = {}
local FACTION_ORDER = {
    human = 1,
    undead = 2,
    nature = 3,
    demon = 4,
    unfrozen = 5,
    dungeon = 6,
}

------------------------------------------------------------------------------------------------------------------------
-- Displays a variable
------------------------------------------------------------------------------------------------------------------------
local function dump(target)
    return '<pre>' .. mw.dumpObject(target) .. '</pre>'
end

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
-- Retrieves the most important data from Cargo
------------------------------------------------------------------------------------------------------------------------
local function queryMain(lang)
    local tables = 'Law, Translation'
    local fields = '' ..
        'Law.id=id, ' ..
        'Law.faction=faction, ' ..
        'Law.tier=tier, ' ..
        'Law.icon=icon, ' ..
        -- Translation
        'Translation.variant=variant, ' ..
        'Translation.language=language, ' ..
        'Translation.name=name, ' ..
        'Translation.description=description'

    local cargoArgs = {
        join = 'Law.id = Translation.target_id',
        where = 'Translation.language = "' .. lang .. '"',
        limit = 10
    }
    return mw.ext.cargo.query(tables, fields, cargoArgs)
end


------------------------------------------------------------------------------------------------------------------------
-- Scans the Cargo results and folds multiple rows belonging to a Law into a single row:
-- |  Name  |  Faction  |  Tier  |  Icon  |  Desc1  |  Desc2  |  Desc3  |  Cost  |  Side  |  Slot  |
------------------------------------------------------------------------------------------------------------------------
local function consolidateMain(results)
    local hub = {}
    for _, row in ipairs(results) do
        local id = row.id
        local entry = hub[id]
        if not entry then
            entry = {}
            entry.faction = row.faction
            entry.tier = row.tier
            entry.icon = row.icon
            entry.costs = nil -- added later on by `addCosts()`
            entry.side = nil -- added later on by `addPositions()`
            entry.slot = nil -- added later on by `addPositions()`
            hub[id] = entry
        end
        if row.name then
            entry.name = row.name
        end
        if row.description then
            entry['desc' .. row.variant] = row.description
        end
    end
    return hub
end

------------------------------------------------------------------------------------------------------------------------
-- Mutates the Laws hub to include corresponding values from LawLevel
------------------------------------------------------------------------------------------------------------------------
local function addCosts(hub)
    local results = mw.ext.cargo.query('LawLevel', 'law_id, level, cost', { limit = 500 })
    for _, row in ipairs(results) do
        local id = row['law_id']
        local entry = hub[id]
        if entry then
            entry.costs = entry.costs or {}
            entry.costs[tonumber(row.level)] = row.cost
        end
    end
end

------------------------------------------------------------------------------------------------------------------------
-- Mutates the Laws hub to include corresponding values from LawTreePosition
------------------------------------------------------------------------------------------------------------------------
local function addPositions(hub)
    local results = mw.ext.cargo.query('LawTreePosition', 'law_id, side, slot', { limit = 500 })
    for _, row in ipairs(results) do
        local id = row['law_id']
        local entry = hub[id]
        if entry then
            entry.side = row.side
            entry.slot = row.slot
        end
    end
end

------------------------------------------------------------------------------------------------------------------------
-- Converts a dictionary into a linear array
------------------------------------------------------------------------------------------------------------------------
local function flatten(hub)
    local list = {}
    for _, entry in pairs(hub) do
        list[#list + 1] = entry
    end
    return list
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function mergeDescriptions(desc1, desc2, desc3)
    --for i = 1, #desc1 do
    --    local char = string.sub(desc1, i, i) -- Slices from index i to i
    --    print(char)
    --end
    return desc1
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function mergeTexts(laws)
    for _, row in ipairs(laws) do
        local costs = row.costs
        row.costs = table.concat(costs, "/")
        row.desc1 = mergeDescriptions(row.desc1, row.desc2, row.desc3);
    end
end

------------------------------------------------------------------------------------------------------------------------
-- Decides the order between two units, for sorting purposes.
------------------------------------------------------------------------------------------------------------------------
local function sortLaws(a, b)
    local rankA = FACTION_ORDER[a.faction] or 99
    local rankB = FACTION_ORDER[b.faction] or 99

    if rankA ~= rankB then
        return rankA < rankB
    end

    if a.tier ~= a.tier then
        return a.tier < a.tier
    end

    --local sideRankA = a.side == ''
    --if a.upgradeRank ~= unitB.upgradeRank then
    --    return unitA.upgradeRank < unitB.upgradeRank
    --end

    return a.slot < b.slot
end

------------------------------------------------------------------------------------------------------------------------
-- Boilerplate for the header cells
------------------------------------------------------------------------------------------------------------------------
local function addTh(tr, text)
    tr:tag('th'):wikitext(text):done()
end

------------------------------------------------------------------------------------------------------------------------
-- Boilerplate for the body cells
------------------------------------------------------------------------------------------------------------------------
local function addTd(tr, text)
    tr:tag('td'):wikitext(text):done()
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function createHeader(htmlTable)
    local tr = htmlTable:tag('tr')
    addTh(tr, 'Name')
    addTh(tr, 'Faction')
    addTh(tr, 'Tier')
    addTh(tr, 'Side')
    addTh(tr, 'Description')
    addTh(tr, 'Cost')
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function createBody(htmlTable, laws)
    for _, u in ipairs(laws) do
        local tr = htmlTable:tag('tr')
        addTd(tr, u.name)
        addTd(tr, u.faction)
        addTd(tr, u.tier)
        addTd(tr, u.side)
        addTd(tr, u.desc1)
        addTd(tr, u.costs)
    end
end

------------------------------------------------------------------------------------------------------------------------
-- Main public function
------------------------------------------------------------------------------------------------------------------------
function p.display(frame)
    local lang = getCurrentLang()
    local suffix = lang ~= 'en' and '/' .. lang or ''

    -- Cargo
    local main = queryMain(lang)
    local hub = consolidateMain(main)
    addCosts(hub);
    addPositions(hub);
    local laws = flatten(hub);

    -- Various manipulations
    mergeTexts(laws)
    table.sort(laws, sortLaws)

    --local laws = consolidateResults(results)

    -- Table
    local htmlTable = mw.html.create('table')
    htmlTable:addClass('wikitable sortable')
    createHeader(htmlTable)
    createBody(htmlTable, laws)

    --return dump(laws)
    -- Output
    local styleTag = frame:extensionTag('templatestyles', '', { src = frame:getTitle() .. '/styles.css' })
    return styleTag .. tostring(htmlTable)
end

return p