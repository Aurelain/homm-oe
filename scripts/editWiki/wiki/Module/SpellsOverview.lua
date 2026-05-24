-- Usage: {{#invoke:SpellsOverview|display}}
local p = {}
local SCHOOL_ORDER = {
    day = 1,
    night = 2,
    space = 3,
    primal = 4,
    neutral = 5,
}
local SCHOOL_ICON = {
    day = 'Skill_Expert_Daylight_Magic',
    night = 'Skill_Expert_Nightshade_Magic',
    space = 'Skill_Expert_Arcane_Magic',
    primal = 'Skill_Expert_Primal_Magic',
    neutral = "Dorearth's_Tide",
}
local SCHOOL_MAPPING = {
    Daylight = 'day',
    Nightshade = 'night',
    Arcane = 'space',
    Primal = 'primal',
    Neutral = 'neutral',
}
-- Note: The right side is just a fallback, it will seldom be used.
local TRANSLATION_IDS = {
    wiki_name = '~Name',                            -- Data:WikiTranslations
    wiki_spells_school = '~School',                 -- Data:WikiTranslations
    tier = '~Tier',
    unit_window_narrative = '~Description',
    battle_spellbook_neutral = '~Neutral Magic',
    mana_cost = '~Mana Cost',
    battle_spellbook_world = '~Global Map Spells',
    battle_spellbook_battle = '~Battle Spells',
    wiki_spells_masterful = '~Masterful',           -- Data:WikiTranslations
    wiki_spells_regular = '~Regular'                -- Data:WikiTranslations
}
-- Note: The right side is just a fallback, it will seldom be used.
local TRANSLATION_IDS_SCHOOL = {
    skill_magic_day = '~Daylight Magic',
    skill_magic_night = '~Nightshade Magic',
    skill_magic_space = '~Arcane Magic',
    skill_magic_primal = '~Primal Magic',
}
local PLACE_ICONS = {
    'Global map spells',      -- 1 = Global Map Spell
    'Battle spells',          -- 2 = Battle Spell
}
local MASTERFUL_ICONS = {
    'Demonic_heart_artifact', -- 1 = Masterful Spell
    'Icon_QuestLog_Sub',      -- 2 = Normal Spell
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
local function translateIds(ids, lang, extra)
    -- Key list
    local list = {}
    for key, _ in pairs(ids) do
        list[#list + 1] = key
    end
    local idListString = '"' .. table.concat(list, '", "') .. '"'

    -- Cargo
    local where = {}
    table.insert(where, 'target_id IN (' .. idListString .. ')')
    table.insert(where, 'language = "' .. lang .. '"')
    if extra then
        table.insert(where, extra)
    end
    local results = mw.ext.cargo.query('Translation', 'target_id, name', {
        where = table.concat(where, ' AND '),
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
        if not string.match(id, 'astral_summon_%D') then
            if not entry then
                entry = {}
                entry.id = row.id
                entry.school = row.school
                entry.rank = tonumber(row.rank)
                entry.used_on_map = 2 - tonumber(row.used_on_map)
                entry.icon = row.icon
                entry.is_special_magic = 2 - tonumber(row.is_special_magic)
                entry.mana_cost = 0 -- added later by `addManaCost()`
                entry.name = ''     -- see below
                entry.bonus2 = ''   -- see below
                entry.bonus3 = ''   -- see below
                entry.bonus4 = ''   -- see below
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
--
------------------------------------------------------------------------------------------------------------------------
local function addSchoolWords(words, lang, suffix)
    local wordsSchool = translateIds(TRANSLATION_IDS_SCHOOL, lang, 'type="skill"')
    for key, value in pairs(wordsSchool) do
        local school = string.match(key, "[^_]*$")
        local icon = '[[File:' .. SCHOOL_ICON[school] .. '.png|64px|link=]]'
        words[school] = icon .. '<br>' .. '[[' .. value .. ']]'
    end
    words.neutral = words.battle_spellbook_neutral -- manual patch, because Neutral Magic is not a Skill
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
    addTh(tr, words.wiki_spells_school)
    addTh(tr, words.tier)
    addTh(tr, words.unit_window_narrative)
    addTh(tr, '[[File:Mana_icon.png|24px|' .. words.mana_cost .. ']]')
    addTh(tr, '[[File:' .. PLACE_ICONS[1] .. '.png|32px|' .. words.battle_spellbook_world .. ']]')
    addTh(tr, '[[File:' .. MASTERFUL_ICONS[1] .. '.png|32px|' .. words.wiki_spells_masterful .. ']]')
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function buildDescription(spell)
    if spell.bonus1 then
        return spell.desc1
    end
    local list = {}
    table.insert(list, spell.bonus2)
    table.insert(list, spell.bonus3)
    table.insert(list, spell.bonus4)
    return spell.desc1 .. '\n<ol start="2"><li>' .. table.concat(list, '</li><li>') .. '</li></ol>'
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function addUsedOnMap(tr, words, value)
    local fileName = PLACE_ICONS[value]
    local title = value == 1 and words.battle_spellbook_world or words.battle_spellbook_battle
    local text = '[[File:' .. fileName .. '.png|40px|' .. title .. '|link=]]'
    tr:tag('td'):attr('data-sort-value', value):wikitext(text):done()
end


------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function addMasterful(tr, words, value)
    local fileName = MASTERFUL_ICONS[value]
    local title = value == 1 and words.wiki_spells_masterful or words.wiki_spells_regular
    local text = '[[File:' .. fileName .. '.png|40px|' .. title .. '|link=]]'
    tr:tag('td'):attr('data-sort-value', value):wikitext(text):done()
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function createBody(htmlTable, spells, words)
    local currentRank = spells[1].rank
    local currentSchool = spells[1].school
    for _, u in ipairs(spells) do
        local schoolName = words[u.school]

        -- separators
        if u.school ~= currentSchool then
            currentSchool = u.school
            currentRank = u.rank
            addSeparator(htmlTable, 'separator-large', string.gsub(schoolName, '<br>', ' '))
        elseif u.rank ~= currentRank then
            currentRank = u.rank
            addSeparator(htmlTable, 'separator-tiny', '')
        end

        local tr = htmlTable:tag('tr')
        addTd(tr, '[[File:' .. u.icon .. '.png|64px|link=]] ' .. u.name)
        addTd(tr, schoolName)
        addTd(tr, ROMAN[u.rank])
        addTd(tr, buildDescription(u))
        addTd(tr, u.mana_cost .. ' [[File:Mana_icon.png|24px|link=]]')
        addUsedOnMap(tr, words, u.used_on_map)
        addMasterful(tr, words, u.is_special_magic)
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
    local suffix = lang ~= 'en' and '/' .. lang or ''
    local words = translateIds(TRANSLATION_IDS, lang)
    addSchoolWords(words, lang, suffix)

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
