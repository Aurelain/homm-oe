local p = {}
local UnitModule = require('Module:Unit')
local LocGetString = require('Module:LocGetString')
local factionUnits = mw.loadData('Module:Sandbox/AurelainFactionUnits')
local statColumns = {
    { 
    	label = "Faction", -- forced EN
    	icon = "Icon_LawsPoint",
    },
    { 
    	label = "Tier", -- forced EN
    	icon = "Icon Resource Graal",
    },
    { 
    	label = "Cost", -- forced EN
    	icon = "Icon_Resource_Gold",
    },
    { 
    	label = "unit_health",
    	icon = "Health Icon",
    },
    { 
    	label = "unit_attack",
    	icon = "Icon_Stats_Attack",
    },
    { 
    	label = "unit_defence",
    	icon = "Icon_Stats_Defence",
    },
    { 
    	label = "unit_damage",
    	icon = "Icon_Stats_Damage",
    },
    { 
    	label = "unit_init",
    	icon = "Icon_Stats_Initiative",
    },
    { 
    	label = "unit_speed",
    	icon = "Icon_Stats_Speed",
    },
}
local factionsOrder = {
	'Temple', 
	'Necropolis', 
	'Grove', 
	'Hive', 
	'Schism', 
	'Dungeon', 
	'Neutral',
}

--------------------------------------------------------------------------------
-- Wrapper for Module:Unit.get()
--------------------------------------------------------------------------------
local function get(unit, property, lang)
	local result = UnitModule.get({ args = { unit, property, lang or "en" } })
    return (result and result ~= '') and result or '—'
end

--------------------------------------------------------------------------------
-- Wrapper for Module:LocGetString.getText()
--------------------------------------------------------------------------------
local function describe(sid, lang)
    local result = LocGetString.getText({ args = { sid = sid, lang = lang } })
    return (result and result ~= '') and result or sid
end

--------------------------------------------------------------------------------
-- Detects the current page's language
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
-- Suggests what "/lang" suffix to use
--------------------------------------------------------------------------------
local function getLangSuffix(lang)
    return lang == 'en' and '' or '/' .. lang
end


--------------------------------------------------------------------------------
-- Obtains a liniar list of units, sorted by faction
--------------------------------------------------------------------------------
local function flattenUnits()
    local result = {}
    for _, key in ipairs(factionsOrder) do
        local subArray = factionUnits[key]
        if type(subArray) == "table" then
            for _, value in ipairs(subArray) do
                table.insert(result, value)
            end
        end
    end
    return result
end

--------------------------------------------------------------------------------
-- Table header
--------------------------------------------------------------------------------
local function generateTableHeader(lang)
	local row = '!'
	row = row .. '[[File:Icon QuestLog Main.png|24px|Unit]]'
    for _, col in ipairs(statColumns) do
        row = row .. ' !! [[File:' .. col.icon .. '.png|24px|' .. describe(col.label, lang) .. ']]'
    end
    return row
end

--------------------------------------------------------------------------------
-- Main public function
--------------------------------------------------------------------------------
function p.renderStatsOverview()
    local lang = getCurrentLang()
    local langSuffix = getLangSuffix(lang)
    local unitList = flattenUnits()
    local output = {}
    
    -- Start table
    table.insert(output, '{| class="wikitable sortable"')
    table.insert(output, generateTableHeader(lang))
    
    -- Body
    for _, unitName in ipairs(unitList) do
        table.insert(output, '|-')

        -- unit
        local nameX = get(unitName, 'name', lang)
        local page = unitName .. langSuffix
        local imgFile = 'File:' .. unitName .. ' icon.png'
        local imgLink = 'link=' .. page
        local imgTt = nameX
        local img = '[[' .. imgFile .. '|40px|' .. imgLink .. '|' .. imgTt .. ']]'
        local link = '[[' .. page .. '|' .. nameX .. ']]'
        table.insert(output, '| ' .. img .. ' ' .. link)
        
        -- faction
        local factionEn = get(unitName, 'faction', 'en')
        local factionX = get(unitName, 'faction', lang)
        table.insert(output, '| [[' .. factionEn .. '_Units' .. langSuffix .. '|' .. factionX .. ']]')
        
        -- the rest
        table.insert(output, '| ' .. get(unitName, 'tier'))
        table.insert(output, '| ' .. get(unitName, 'cost'))
        table.insert(output, '| ' .. get(unitName, 'hp'))
        table.insert(output, '| ' .. get(unitName, 'offence'))
        table.insert(output, '| ' .. get(unitName, 'defence'))
        table.insert(output, '| ' .. get(unitName, 'damageMin') .. '-' .. get(unitName, 'damageMax'))
        table.insert(output, '| ' .. get(unitName, 'initiative'))
        table.insert(output, '| ' .. get(unitName, 'speed'))
    end
    
    table.insert(output, '|}')
    return table.concat(output, '\n')
end

return p