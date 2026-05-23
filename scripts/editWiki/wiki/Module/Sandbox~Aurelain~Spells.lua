-- Usage: {{#invoke:SpellsOverview|display}}
local p = {}
local SCHOOL_ORDER = {
    day =     1,
    night =   2,
    space =   3,
    primal =  4,
    neutral = 5,
}
local SCHOOL_NAME_ID = {
    day =     'skill_magic_day',
    night =   'skill_magic_night',
    space =   'skill_magic_space',
    primal =  'skill_magic_primal',
    neutral = 'skill_magic_neutral',
}
local SCHOOL_MAPPING = {
    Daylight =     'day',
    Nightshade =   'night',
    Arcane =       'space',
    Primal =       'primal',
    Neutral =      'neutral',
}
local TRANSLATION_IDS = {
    wiki_name =         '~Name',         -- manually translated in Data:WikiTranslations/xx
    school =            '~School',
    tier =              '~Tier',
    description =       '~Description',   ---- missing, should be taken from `ui.unit_window_narrative`
    mana = '~Mana',                     -- manually translated in Data:WikiTranslations/xx
    skill_magic_day    = '~Daylight Magic',
    skill_magic_night    = '~Nightshade Magic',
    skill_magic_space    = '~Arcane Magic',
    skill_magic_primal    = '~Primal Magic',
    skill_magic_neutral    = '~Neutral Magic',
}
local ROMAN = { 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII' }
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
-- Retrieves the text for some specific ids from Cargo Translations.
------------------------------------------------------------------------------------------------------------------------
local function translateIds(ids, lang)
    -- Key list
    local list = {}
    for key, _ in pairs(ids) do
        list[#list + 1] = key
    end
    local idListString = '"' .. table.concat(list, '", "') .. '"'

    -- Cargo
    local results = mw.ext.cargo.query('Translation', 'target_id, name', {
         where = 'target_id IN (' .. idListString .. ') AND language = "' .. lang .. '"',
         limit = 100
     })

    -- Dictionary
    local dictionary = mw.clone(ids)
    if results then
        for _, row in ipairs(results) do
            dictionary[row['target_id']] = row['name']
        end
    end
    return dictionary
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
-- Retrieves the most important data from Cargo
------------------------------------------------------------------------------------------------------------------------
local function queryMain(lang, forcedSchool)
    local tables = 'Spell, Translation'
    local fields = '' ..
        'Spell.id = id, ' ..
        'Spell.school = school, ' ..
        'Spell.rank = rank, ' ..
        'Spell.used_on_map = used_on_map, ' ..
        'Spell.icon = icon, ' ..
        'Spell.is_special_magic = is_special_magic, ' ..
        -- Translation
        'Translation.variant = variant, ' ..
        'Translation.name = name, ' ..
        'Translation.description = description,' ..
        'Translation.bonus_description = bonus_description'
    local where = {}
    if forcedSchool then
        table.insert(where, 'Spell.school="' .. forcedSchool .. '"')
    end
    table.insert(where, 'Translation.language = "' .. lang .. '"')
    local cargoArgs = {
        join = 'Spell.id = Translation.target_id',
        where = table.concat(where, ' AND '),
        limit = 1000
    }
    return mw.ext.cargo.query(tables, fields, cargoArgs)
end

------------------------------------------------------------------------------------------------------------------------
-- Scans the Cargo results and folds the all rows belonging to a Spell into a single dictionary:
------------------------------------------------------------------------------------------------------------------------
local function consolidateMain(results)
    local hub = {}
    for _, row in ipairs(results) do
        local id = row.id
        local entry = hub[id]
        if not entry then
            entry = {}
            entry.id = row.id
            entry.school = row.school
            entry.rank = tonumber(row.rank)
            entry.used_on_map = row.used_on_map
            entry.icon = row.icon
            entry.is_special_magic = row.is_special_magic
            entry.mana_cost = 0  -- added later by `addManaCost()`
            entry.name = '' -- see below
            entry.bonus2 = '' -- see below
            entry.bonus3 = '' -- see below
            entry.bonus4 = '' -- see below
            hub[id] = entry
        end
        if row.name then
            entry.name = row.name
        end
        if row.description then
            entry['desc' .. row.variant] = row.description
        end
        if row.bonus_description then
            entry['bonus' .. row.variant] = row.bonus_description
        end
    end
    return hub
end

------------------------------------------------------------------------------------------------------------------------
-- Mutates the Spells hub to include corresponding mana cost from the SpellRank Cargo table
------------------------------------------------------------------------------------------------------------------------
local function addManaCost(hub)
    local results = mw.ext.cargo.query('SpellRank', 'spell_id, mana_cost', { limit = 1000 })
    for _, row in ipairs(results) do
        local id = row.spell_id
        local entry = hub[id]
        if entry then
            entry.mana_cost = tonumber(row.mana_cost)
        end
    end
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function sortSpells(a, b)
    local schoolA = SCHOOL_ORDER[a.school] or 99
    local schoolB = SCHOOL_ORDER[b.school] or 99

    if schoolA ~= schoolB then
        return schoolA < schoolB
    end

    if a.rank ~= b.rank then
        return a.rank < b.rank
    end

    return a.id < b.id
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
-- Boilerplate for the body cells
------------------------------------------------------------------------------------------------------------------------
local function addSeparator(htmlTable, className, content)
    htmlTable:tag('tr')
        :addClass('separator')
        :addClass(className)
        :tag('td'):attr('colspan', 7):wikitext(content):done()
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function createHeader(htmlTable, words)
    local tr = htmlTable:tag('tr')
    addTh(tr, words.wiki_name)
    addTh(tr, words.school)
    addTh(tr, words.tier)
    addTh(tr, words.description)
    addTh(tr, words.mana)
    addTh(tr, words.used_on_map)
    addTh(tr, words.is_special_magic)
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function createBody(htmlTable, spells, words)
    local currentRank = spells[1].rank
    local currentSchool = spells[1].school
    for _, u in ipairs(spells) do
        local schoolName = words[SCHOOL_NAME_ID[u.school]]

        -- separators
        if u.school ~= currentSchool then
            currentSchool = u.school
            currentRank = u.rank
            addSeparator(htmlTable, 'separator-large', schoolName)
        elseif u.rank ~= currentRank then
            currentRank = u.rank
            addSeparator(htmlTable, 'separator-tiny', '')
        end

        local tr = htmlTable:tag('tr')
        addTd(tr, '[[File:' .. u.icon .. '.png|link=]] ' .. u.name)
        addTd(tr, schoolName)
        addTd(tr, ROMAN[u.rank])
        addTd(tr, u.desc1 .. '<br>- ' .. u.bonus2 .. '<br>- ' .. u.bonus3 .. '<br>- ' .. u.bonus4)
        addTd(tr, u.mana_cost)
        addTd(tr, u.used_on_map)
        addTd(tr, u.is_special_magic)
    end
end

------------------------------------------------------------------------------------------------------------------------
-- Main public function
------------------------------------------------------------------------------------------------------------------------
function p.display(frame)
    -- Args
    local args = frame.args
    local forcedSchool = mw.text.trim(args[1] or args.school or '')
    forcedSchool = SCHOOL_MAPPING[forcedSchool] or nil

    -- Language
    local lang = getCurrentLang()
    local words = translateIds(TRANSLATION_IDS, lang)

    -- Cargo
    local main = queryMain(lang, forcedSchool)
    local hub = consolidateMain(main)
    addManaCost(hub);
    local spells = flatten(hub);

    -- Various manipulations
    --mergeTexts(laws)
    table.sort(spells, sortSpells)

    -- Table
    local htmlTable = mw.html.create('table')
    htmlTable:addClass('wikitable sortable')
    createHeader(htmlTable, words)
    createBody(htmlTable, spells, words)

    -- Output
    local styleTag = frame:extensionTag('templatestyles', '', { src = frame:getTitle() .. '/styles.css' })
    --return dump(words)
    return styleTag .. tostring(htmlTable)
end

return p