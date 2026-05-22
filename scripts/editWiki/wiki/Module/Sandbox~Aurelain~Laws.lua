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
local SIDE_RANK = {
    faction = 1,
    army = 2,
}
local SIDE_ICONS = {
    faction = 'Sub_skill_economy_1_icon',
    army = 'Sub_skill_battlemage_4_icon',
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
        limit = 1000
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
            entry.faction = row.faction or ''
            entry.tier = row.tier
            entry.icon = row.icon
            entry.costs = nil -- added later on by `addCosts()`
            entry.side = ''  -- added later on by `addPositions()`
            entry.slot = 0    -- added later on by `addPositions()`
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
            entry.slot = row.slot or 0
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
local function checkEquality(chars)
    local recent = nil
    for _, c in pairs(chars) do
        if recent == nil then
            recent = c
        elseif recent ~= c then
            return false
        end
    end
    return true
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function findNextNonDigit(text, index)
    for i = index + 1, #text do
        local char = string.sub(text, i, i)
        if string.match(char, "%D") then
            return i
        end
    end
    return nil
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function advanceActors(actors)
    local output = {};
    for _, actor in pairs(actors) do
        local cursor = actor.cursor
        local next = findNextNonDigit(actor.text, cursor)
        local skipped = string.sub(actor.text, cursor, next)
        actor.cursor = next
        table.insert(output, '<span>' .. skipped .. '</span>')
    end
    return '<span class="island">' .. table.concat(output, '/') .. '</span>'
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function mergeDescriptions(candidates)
    local actors = {};
    for _, text in ipairs(candidates) do
        if text then
            table.insert(actors, {
                text = text,
                cursor = 0
            })
        end
    end
    local output = {}
    for _ = 1, 1000 do
        local currentChar = {}
        for i, actor in ipairs(actors) do
            actor.cursor = actor.cursor + 1
            currentChar[i] = string.sub(actor.text, actor.cursor, actor.cursor)
        end
        local c = currentChar[1]
        if c == '' then
            break
        end
        if not checkEquality(currentChar) then
            local island = advanceActors(actors)
            table.insert(output, island)
        else
            table.insert(output, currentChar[1])
        end
    end
    return table.concat(output, '')
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function mergeCosts(costs)
    local output = {}
    for _, cost in ipairs(costs) do
        table.insert(output, '<span>' .. cost .. '</span>')
    end
    return '<span class="island">' .. table.concat(output, '/') .. '</span>'
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function mergeTexts(laws)
    for _, row in ipairs(laws) do
        row.costsText = mergeCosts(row.costs)
        row.description = mergeDescriptions({ row.desc1, row.desc2, row.desc3 });
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

    if a.tier ~= b.tier then
        return a.tier < b.tier
    end

    local sideRankA = SIDE_RANK[a.side] or 99
    local sideRankB = SIDE_RANK[b.side] or 99
    if sideRankA ~= sideRankB then
        return sideRankA < sideRankB
    end

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
local function createBody(htmlTable, laws, frame)
    local currentTier = laws[1].tier
    local currentFaction = laws[1].faction
    for _, u in ipairs(laws) do
        local factionName = frame:preprocess('{{F|' .. u.faction .. '}}')

        -- separators
        if u.faction ~= currentFaction then
            currentFaction = u.faction
            currentTier = u.tier
            local separator = htmlTable:tag('tr'):addClass('separator'):addClass('separator-large')
            separator:tag('td'):attr('colspan', 6):wikitext(factionName):done()
        elseif u.tier ~= currentTier then
            currentTier = u.tier
            local separator = htmlTable:tag('tr'):addClass('separator'):addClass('separator-tiny')
            separator:tag('td'):attr('colspan', 6):done()
        end

        local sideIcon = SIDE_ICONS[u.side]
        local tr = htmlTable:tag('tr')
        addTd(tr, u.name)
        addTd(tr, factionName)
        addTd(tr, u.tier)
        addTd(tr, sideIcon and '[[File:' .. sideIcon .. '.png|24px|' .. u.side .. '|link=]]')
        addTd(tr, u.description)
        addTd(tr, u.costsText .. '[[File:Icon_LawsPoint.png|link=]]')
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

    -- Table
    local htmlTable = mw.html.create('table')
    htmlTable:addClass('wikitable sortable')
    createHeader(htmlTable)
    createBody(htmlTable, laws, frame)

    -- Output
    local styleTag = frame:extensionTag('templatestyles', '', { src = frame:getTitle() .. '/styles.css' })
    --return dump(htmlTable)
    return styleTag .. tostring(htmlTable)
end

return p
