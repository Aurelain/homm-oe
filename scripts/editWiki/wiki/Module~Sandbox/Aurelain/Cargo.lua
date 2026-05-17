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
local IDS_FOR_TRANSLATION = {
    -- faction names used in the Table Body
    'human',
    'undead',
    'nature',
    'demon',
    'unfrozen',
    'dungeon',
    'neutral',
    -- other texts used in the Table Header
    'hp',
}

--------------------------------------------------------------------------------
-- Detects the current language from the URL
--------------------------------------------------------------------------------
local function getCurrentLang()
    local title = mw.title.getCurrentTitle()
    if title.isSubpage then
        if mw.language.isSupportedLanguage(title.subpageText) then
            return title.subpageText
        end
    end
    return 'en'
end

--------------------------------------------------------------------------------
-- Awards a number from 0 to 3 for a unit, based on how upgraded it is
--------------------------------------------------------------------------------
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

--------------------------------------------------------------------------------
-- Retrieves the data from Cargo
--------------------------------------------------------------------------------
local function query(lang)
    local tables = 'Unit, Translation'
    local fields = '' .. 
               'Unit.id=id, ' ..
               'Unit.faction=faction, ' ..
               'Unit.tier=tier, ' ..
               'Unit.hp=hp, ' ..
               'Unit.offence=attack, ' ..
               'Unit.base_sid=base, ' ..
               'Unit.upgrade_sid=upgrade, ' ..
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

--------------------------------------------------------------------------------
-- Scans the Cargo results and folds the EN and lang rows into a single row
--------------------------------------------------------------------------------
local function consolidateResults(results, lang)
    local units = {}
    for _, row in ipairs(results) do
        local id = row['id']
        
        -- If this is the first time seeing this id, set up its basic stats
        if not units[id] then
            units[id] = {
            	id=row['id'],
            	faction=row['faction'],
            	tier=row['tier'],
                hp = row['hp'],
                attack = row['attack'],
                nameEn = nil,
                nameX = nil,
                upgradeRank = computeUpgradeRank(row)
            }
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

--------------------------------------------------------------------------------
-- Decides the order between two units, for sorting purposes.
--------------------------------------------------------------------------------
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

--------------------------------------------------------------------------------
-- Retrieves the text for some specific ids from Cargo Translations.
--------------------------------------------------------------------------------
function translateIds(ids, lang)
	-- Cargo
    local idListString = '"' .. table.concat(ids, '", "') .. '"'
    local tables = 'Translation'
    local fields = 'target_id, name'
    local cargoArgs = {
        where = 'target_id IN (' .. idListString .. ') AND language = "' .. lang .. '"',
        limit = 100
    }
    local results = mw.ext.cargo.query(tables, fields, cargoArgs)

    -- Dictionary
    local localizedNames = {}
    if results then
        for _, row in ipairs(results) do
            localizedNames[row['target_id']] = row['name']
        end
    end
    return localizedNames
end

--------------------------------------------------------------------------------
-- Main public function
--------------------------------------------------------------------------------
function p.displayOverview()
    local lang = getCurrentLang()
    local dictionary = translateIds(IDS_FOR_TRANSLATION, lang)
    local results = query(lang)
    local units = consolidateResults(results, lang)
    table.sort(units, sortUnits)

    -- Table
    local htmlTable = mw.html.create('table')
    htmlTable:addClass('wikitable sortable')
        
    -- Header
    local header = htmlTable:tag('tr')
    header:tag('th'):wikitext('id'):done()
    header:tag('th'):wikitext('Unit Name'):done()
    header:tag('th'):wikitext('Faction id'):done()
    header:tag('th'):wikitext('Faction text'):done()
    header:tag('th'):wikitext(dictionary['hp']):done()
    header:tag('th'):wikitext('Attack'):done()
    header:tag('th'):wikitext('upgradeRank'):done()

    -- Body
    for _, u in ipairs(units) do
        local page = u.nameEn .. (lang ~= 'en' and '/' .. lang or '')
        local tr = htmlTable:tag('tr')
        tr:tag('td'):wikitext(u.id):done()
        tr:tag('td'):wikitext('[[' .. page .. '|' .. u.nameX .. ']]'):done() 
        tr:tag('td'):wikitext(u.faction):done()
        tr:tag('td'):wikitext(dictionary[u.faction]):done()
        tr:tag('td'):wikitext(tostring(u.hp)):done()
        tr:tag('td'):wikitext(tostring(u.attack)):done()
        tr:tag('td'):wikitext(u.upgradeRank):done()
    end

    return tostring(htmlTable)
end

return p