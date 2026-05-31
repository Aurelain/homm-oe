-- Usage: {{#invoke:SpellsOverview|display}}
local p = {}

-- Currently (2026-05-29), these spells have a WIP icon, so we assume they're not actually in-game
-- TODO: Revisit this list in the future
local FORBIDDEN_IDS = {
    bonus_magic_kill_summon = true,
    neutral_1_magic_back_to_garrison = true,
    neutral_1_magic_mana_transfer = true,
    night_bonus_magic_1_magic = true,
    primal_bonus_magic_1_magic = true,
    bonus_magic_astral_summon_4 = true, -- how do you get Master Summon Avatar?
    bonus_magic_astral_summon_5 = true, -- how do you get Grandmaster Summon Avatar?
}

local SCHOOL_ORDER = {
    day = 1,
    night = 2,
    space = 3,
    primal = 4,
    neutral = 5,
}

local SCHOOL_ICON = {
    day = 'Daylight_disk',
    night = 'Nightshade_disk',
    space = 'Arcane_disk',
    primal = 'Primal_disk',
    neutral = 'Neutral_disk',
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
    wiki_name = 'Name',
    wiki_spells_school = 'School',
    tier = 'Tier',
    unit_window_narrative = 'Description',
    battle_spellbook_neutral = 'Neutral Magic',
    mana_cost = 'Mana Cost',
    battle_spellbook_world = 'Global Map Spells',
    battle_spellbook_battle = 'Battle Spells',
    wiki_spells_masterful = 'Masterful',
    wiki_spells_has_masterful = 'Has Masterful<br>version',
    wiki_spells_no_masterful = 'No Masterful<br>version available',
    wiki_spells_level = 'Level'
}

-- Note: The right side is a fallback, but also used for the page link.
local TRANSLATION_IDS_SCHOOL = {
    skill_magic_day = 'Daylight Magic',
    skill_magic_night = 'Nightshade Magic',
    skill_magic_space = 'Arcane Magic',
    skill_magic_primal = 'Primal Magic',
    skill_magic_neutral = 'Neutral Magic',
}

local PLACE_ICONS = {
    'Global_map_spells', -- 1 = Global Map Spell
    'Battle_spells',     -- 2 = Battle Spell
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
-- Gets the second sentence from the speciality of heroes that start with a masterful spell.
------------------------------------------------------------------------------------------------------------------------
local function collectMasterfulBlurbs(lang)
    local results = mw.ext.cargo.query('Translation', 'target_id, description', {
        where = "language='en' AND description LIKE '%starts with the%'",
        limit = 100
    })
    local nameToBlurb = {}
    for _, row in ipairs(results) do
        local id = row.target_id
        local description = row.description
        local shortName = mw.ustring.match(description, '“Masterful ([a-zA-Z ’-]+)”')
        shortName = mw.ustring.gsub(shortName, "’", "'")
        if lang ~= 'en' then
            local huntResult = mw.ext.cargo.query('Translation', 'description', {
                where = "language='" .. lang .. "' AND target_id='" .. id .. "'",
                limit = 1
            })
            local huntRow = huntResult[1] or {}
            description = huntRow.description or ''
        end
        local secondSentence = mw.ustring.match(description, "[.,。]%s*([^.。]+[.。])") or ''
        nameToBlurb[shortName] = secondSentence
    end
    return nameToBlurb
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function mapMasterfulEnglishNameToId()
    local results = mw.ext.cargo.query('Translation', 'target_id, name', {
        where = "language='en' AND name LIKE 'Masterful %'",
        limit = 100
    })
    local nameToId = {}
    for _, row in ipairs(results) do
        local cleanName = string.gsub(row.name, 'Masterful ', '')
        local cleanId = string.gsub(row.target_id, '_special$', '')
        nameToId[cleanName] = cleanId
    end
    return nameToId
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function joinMasterfuls(nameToBlurb, nameToId)
    local idToBlurb = {}
    for name, id in pairs(nameToId) do
        idToBlurb[id] = nameToBlurb[name] or '-'
    end
    return idToBlurb
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
    table.insert(where, 'Spell.is_special_magic !="1"')
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
local function consolidateMain(results, masterfulIdToBlurb)
    local hub = {}
    for _, row in ipairs(results) do
        local id = row.id
        local entry = hub[id]
        if not string.match(id, 'astral_summon_%D') and not FORBIDDEN_IDS[id] then
            if not entry then
                entry = {}
                entry.id = id
                entry.school = row.school
                entry.rank = tonumber(row.rank)
                entry.used_on_map = 2 - tonumber(row.used_on_map)
                entry.icon = row.icon
                entry.mana_cost = 0 -- added later by `addManaCost()`
                entry.name = ''     -- see below
                entry.bonus2 = ''   -- see below
                entry.bonus3 = ''   -- see below
                entry.bonus4 = ''   -- see below
                entry.masterfulBlurb = masterfulIdToBlurb[id]
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
-- Maps each spell id to its English name (for page linking purposes)
------------------------------------------------------------------------------------------------------------------------
local function getPages(forcedSchool)
    local tables = 'Spell, Translation'
    local fields = '' ..
        'Spell.id = id, ' ..
        'Translation.name = name'
    local where = {}
    if forcedSchool then
        table.insert(where, 'Spell.school="' .. forcedSchool .. '"')
    end
    table.insert(where, 'Translation.language = "en"')
    local cargoArgs = {
        join = 'Spell.id = Translation.target_id',
        where = table.concat(where, ' AND '),
        limit = 1000
    }
    local results = mw.ext.cargo.query(tables, fields, cargoArgs)
    local hub = {}
    for _, row in ipairs(results) do
        hub[row.id] = row.name
    end
    hub.bonus_magic_astral_summon_1 = 'Summon_Avatar_(Spell)' -- manual redirect
    hub.bonus_magic_astral_summon_2 = 'Summon_Avatar_(Spell)' -- manual redirect
    hub.bonus_magic_astral_summon_3 = 'Summon_Avatar_(Spell)' -- manual redirect
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
    local backup = mw.clone(TRANSLATION_IDS_SCHOOL)
    local wordsSchool = translateIds(TRANSLATION_IDS_SCHOOL, lang, 'type="skill"')
    wordsSchool.skill_magic_neutral = words.battle_spellbook_neutral -- manual patch (Neutral Magic is not a Skill)
    for key, value in pairs(wordsSchool) do
        local school = string.match(key, "[^_]*$")
        local link = backup[key] .. suffix
        local icon = '[[File:' .. SCHOOL_ICON[school] .. '.png|40px|link=' .. link .. ']]'
        local anchor = '[[' .. link .. '|' .. value .. ']]'
        words[school] = icon .. '<br>' .. anchor
    end
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
        :tag('td'):attr('data-sort-value', ''):attr('colspan', 7):wikitext(content):done()
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function createHeader(htmlTable, words, frame)
    local tr = htmlTable:tag('tr')
    addTh(tr, words.wiki_name)
    addTh(tr, words.wiki_spells_school)
    addTh(tr, words.tier)
    addTh(tr, words.unit_window_narrative)

    local manaIcon = '[[File:Mana_icon.png|24px|link=]]';
    addTh(tr, frame:preprocess('{{hint|' .. manaIcon .. '|' .. words.mana_cost .. '}}'))

    local compassIcon = '[[File:' .. PLACE_ICONS[1] .. '.png|32px|link=]]';
    addTh(tr, frame:preprocess('{{hint|' .. compassIcon .. '|' .. words.battle_spellbook_world .. '}}'))

    local masterfulIcon = '[[File:' .. MASTERFUL_ICONS[1] .. '.png|32px|link=]]';
    addTh(tr, frame:preprocess('{{hint|' .. masterfulIcon .. '|' .. words.wiki_spells_masterful .. '}}'))
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function buildDescription(spell, words)
    local output = {}
    table.insert(output, spell.desc1)
    local level = words.wiki_spells_level
    if spell.bonus2 and spell.bonus2 ~= '' then
        table.insert(output, '<p class="level"><b>' .. level .. ' 2:</b> ' .. spell.bonus2 .. '</p>')
    end
    if spell.bonus3 and spell.bonus3 ~= '' then
        table.insert(output, '<p class="level"><b>' .. level .. ' 3:</b> ' .. spell.bonus3 .. '</p>')
    end
    if spell.bonus4 and spell.bonus4 ~= '' then
        table.insert(output, '<p class="level"><b>' .. level .. ' 4:</b> ' .. spell.bonus4 .. '</p>')
    end
    if spell.masterfulBlurb then
        table.insert(output, '' ..
            '<p class="masterful">' ..
            '<b>' .. words.wiki_spells_masterful .. ':</b> ' ..
            spell.masterfulBlurb ..
            '</p>')
    end
    return table.concat(output, '\n')
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function addIconAndName(tr, spell, pages, suffix)
    local content = {}
    local link = pages[spell.id] or ''
    link = link .. suffix
    local ringFile = '[[File:Frame_Spell_Top_0.png|147px|link=]]'
    local ringDiv = '<div class="ring" style="pointer-events:none">'..ringFile..'</div>'
    local iconFile = '[[File:' .. spell.icon .. '.png|128px|link=' .. link .. ']]'
    table.insert(content, '<div class="medallion">' .. ringDiv .. iconFile .. '</div>')
    table.insert(content, '[[' .. link .. '|' .. spell.name .. ']]')
    addTd(tr, table.concat(content, ''))
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function addUsedOnMap(tr, words, value, frame)
    local fileName = PLACE_ICONS[value]
    local title = value == 1 and words.battle_spellbook_world or words.battle_spellbook_battle
    local file = '[[File:' .. fileName .. '.png|40px|link=]]'
    local text = frame:preprocess('{{hint|' .. file .. '|' .. title .. '}}')
    tr:tag('td'):attr('data-sort-value', value):wikitext(text):done()
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function addMasterful(tr, words, value, frame)
    local nr = value and 1 or 2
    local fileName = MASTERFUL_ICONS[nr]
    local title = value and words.wiki_spells_has_masterful or words.wiki_spells_no_masterful
    local file = '[[File:' .. fileName .. '.png|40px|link=]]'
    local text = frame:preprocess('{{hint|' .. file .. '|' .. title .. '}}')
    tr:tag('td'):attr('data-sort-value', nr):wikitext(text):done()
end

------------------------------------------------------------------------------------------------------------------------
--
------------------------------------------------------------------------------------------------------------------------
local function createBody(htmlTable, spells, words, pages, suffix, frame)
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
        tr:addClass('spell'):addClass(currentSchool)
        addIconAndName(tr, u, pages, suffix)
        addTd(tr, schoolName)
        addTd(tr, ROMAN[u.rank])
        addTd(tr, buildDescription(u, words))
        addTd(tr, u.mana_cost .. ' [[File:Mana_icon.png|24px|link=]]')
        addUsedOnMap(tr, words, u.used_on_map, frame)
        addMasterful(tr, words, u.masterfulBlurb, frame)
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

    -- Masterful blurbs
    local masterfulBlurbs = collectMasterfulBlurbs(lang)
    local masterfulEnglishNameToId = mapMasterfulEnglishNameToId()
    local masterfulIdToBlurb = joinMasterfuls(masterfulBlurbs, masterfulEnglishNameToId)

    -- Cargo
    local main = queryMain(lang, forcedSchool)
    local hub = consolidateMain(main, masterfulIdToBlurb)
    addManaCost(hub);
    local spells = flatten(hub);
    local pages = getPages(forcedSchool)

    -- Various manipulations
    table.sort(spells, sortSpells)

    -- Table
    local htmlTable = mw.html.create('table')
    htmlTable:addClass('wikitable sortable table-nobands')
    createHeader(htmlTable, words, frame)
    createBody(htmlTable, spells, words, pages, suffix, frame)

    -- Output
    local styleTag = frame:extensionTag('templatestyles', '', { src = frame:getTitle() .. '/styles.css' })
    --return dump(pages)
    return styleTag .. tostring(htmlTable)
end

return p
