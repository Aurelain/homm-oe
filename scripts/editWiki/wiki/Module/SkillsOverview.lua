-- Usage: {{#invoke:SkillsOverview|display|lang=en}}
local p = {}

local CATEGORY_MIGHT = 'wiki_skills_might'
local CATEGORY_MAGIC = 'wiki_skills_magic'
local CATEGORY_GENERAL = 'wiki_skills_general'
local CATEGORY_FACTION = 'wiki_skills_faction'

local CATEGORIES = {
    skill_assault = CATEGORY_MIGHT,            -- Offense
    skill_battle_artistry = CATEGORY_MIGHT,    -- Combat
    skill_battlemage = CATEGORY_MAGIC,         -- Battle Magic
    skill_diplomacy = CATEGORY_GENERAL,        -- Diplomacy
    skill_economy = CATEGORY_GENERAL,          -- Economy
    skill_enlightenment = CATEGORY_GENERAL,    -- Insight
    skill_faction_demons = CATEGORY_FACTION,   -- Hive
    skill_faction_dungeon = CATEGORY_FACTION,  -- Dungeon
    skill_faction_humans = CATEGORY_FACTION,   -- Temple
    skill_faction_nature = CATEGORY_FACTION,   -- Grove
    skill_faction_undead = CATEGORY_FACTION,   -- Necropolis
    skill_faction_unfrozen = CATEGORY_FACTION, -- Schism
    skill_first_aid = CATEGORY_GENERAL,        -- currently unused!
    skill_formation = CATEGORY_MIGHT,          -- Battlecraft
    skill_leadership = CATEGORY_MIGHT,         -- Leadership
    skill_logistic = CATEGORY_GENERAL,         -- Logistics
    skill_luck = CATEGORY_MIGHT,               -- Luck
    skill_magic_day = CATEGORY_MAGIC,          -- Daylight
    skill_magic_night = CATEGORY_MAGIC,        -- Nightshade
    skill_magic_primal = CATEGORY_MAGIC,       -- Primal
    skill_magic_space = CATEGORY_MAGIC,        -- Arcane
    skill_mastery = CATEGORY_MAGIC,            -- Wisdom
    skill_protection = CATEGORY_MIGHT,         -- Defense
    skill_resistance = CATEGORY_MIGHT,         -- Resistance
    skill_scouting = CATEGORY_GENERAL,         -- Scouting
    skill_siege = CATEGORY_MIGHT,              -- Siegecraft
    skill_sorcery = CATEGORY_MAGIC,            -- Sorcery
    skill_summoner = CATEGORY_MAGIC,           -- Summon Avatar
    skill_tactics = CATEGORY_MIGHT,            -- Tactics
    skill_trainer = CATEGORY_MIGHT,            -- Recruitment
    skill_wisdom = CATEGORY_MAGIC,             -- Thaumaturgy
}

local ORDER = {
    'skill_assault',          -- Offense
    'skill_protection',       -- Defense
    'skill_leadership',       -- Leadership
    'skill_luck',             -- Luck
    'skill_resistance',       -- Resistance
    'skill_tactics',          -- Tactics
    'skill_formation',        -- Battlecraft
    'skill_siege',            -- Siegecraft
    'skill_trainer',          -- Recruitment
    'skill_battle_artistry',  -- Combat
    'skill_battlemage',       -- Battle Magic
    'skill_sorcery',          -- Sorcery
    'skill_summoner',         -- Summon Avatar
    'skill_mastery',          -- Wisdom
    'skill_magic_day',        -- Daylight
    'skill_magic_night',      -- Nightshade
    'skill_magic_space',      -- Arcane
    'skill_magic_primal',     -- Primal
    'skill_wisdom',           -- Thaumaturgy
    'skill_diplomacy',        -- Diplomacy
    'skill_logistic',         -- Logistics
    'skill_scouting',         -- Scouting
    'skill_enlightenment',    -- Insight
    'skill_economy',          -- Economy
    'skill_faction_humans',   -- Temple
    'skill_faction_undead',   -- Necropolis
    'skill_faction_nature',   -- Grove
    'skill_faction_demons',   -- Hive
    'skill_faction_unfrozen', -- Schism
    'skill_faction_dungeon',  -- Dungeon
    'skill_first_aid',        -- currently unused!
}

-- Note: The right side is just a fallback, it will seldom be used.
local TRANSLATION_IDS = {
    wiki_skills_might = 'Might Skills',
    wiki_skills_magic = 'Magic Skills',
    wiki_skills_general = 'General Skills',
    wiki_skills_faction = 'Faction Skills',
    wiki_skills_levels = 'Levels',
}
------------------------------------------------------------------------------------------------------------------------
-- Debugs a variable
------------------------------------------------------------------------------------------------------------------------
local function dump(target)
    return '<pre>' .. mw.dumpObject(target) .. '</pre>'
end

------------------------------------------------------------------------------------------------------------------------
-- Searches by id for an item in array
------------------------------------------------------------------------------------------------------------------------
local function findInArray(list, id)
    for _, item in ipairs(list) do
        if item and item.id == id then
            return item
        end
    end
    return nil
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
    for key, value in pairs(dictionary) do
        dictionary[key] = value .. '[[Data:WikiTranslations/' .. lang .. '#' .. key .. '|💬]]'
    end
    for _, row in ipairs(results) do
        dictionary[row['target_id']] = row['name']
    end
    return dictionary
end

------------------------------------------------------------------------------------------------------------------------
-- Retrieves the main skill translations from Cargo
------------------------------------------------------------------------------------------------------------------------
local function queryMain(lang, forcedSkill)
    -- fields:
    local fields = {}
    table.insert(fields, 'Skill.id = id');
    table.insert(fields, 'Translation.variant = variant');
    table.insert(fields, 'Translation.name = name');
    table.insert(fields, 'Translation.description = description');

    -- where:
    local where = {}
    if forcedSkill then
        table.insert(where, 'Skill.id="' .. forcedSkill .. '"')
    end
    table.insert(where, 'Skill.variant = "production"')
    table.insert(where, 'Translation.language = "' .. lang .. '"')

    -- query:
    return mw.ext.cargo.query('Skill, Translation', table.concat(fields, ','), {
        join = 'Skill.id = Translation.target_id',
        where = table.concat(where, ' AND '),
        limit = 200
    })
end

------------------------------------------------------------------------------------------------------------------------
-- Retrieves the icons and the offered sub-skills from Cargo
------------------------------------------------------------------------------------------------------------------------
local function queryIconAndOffers(forcedSkill)
    -- fields:
    local fields = {}
    table.insert(fields, 'SkillLevel.skill_id = id');
    table.insert(fields, 'SkillLevel.level = level');
    table.insert(fields, 'SkillLevel.icon = icon');
    table.insert(fields, 'SkillLevel.offered_sub_skills = offered_sub_skills');

    -- where:
    local where = {}
    if forcedSkill then
        table.insert(where, 'SkillLevel.skill_id="' .. forcedSkill .. '"')
    end
    table.insert(where, 'SkillLevel.skill_id NOT LIKE "arena%"')
    table.insert(where, 'SkillLevel.skill_id NOT LIKE "campaign%"')

    -- query:
    return mw.ext.cargo.query('SkillLevel', table.concat(fields, ','), {
        where = table.concat(where, ' AND '),
        limit = 200
    })
end

------------------------------------------------------------------------------------------------------------------------
-- Retrieves the most important data from Cargo
------------------------------------------------------------------------------------------------------------------------
local function querySubs(lang, forcedSkill)
    -- fields:
    local fields = {}
    table.insert(fields, 'SubSkill.id = id');
    table.insert(fields, 'SubSkill.parent_skill_id = parent_skill_id');
    table.insert(fields, 'SubSkill.icon = icon');
    table.insert(fields, 'Translation.name = name');
    table.insert(fields, 'Translation.description = description');

    -- where:
    local where = {}
    if forcedSkill then
        table.insert(where, 'SubSkill.parent_skill_id="' .. forcedSkill .. '"')
    end
    table.insert(where, 'SubSkill.variant = "production"')
    table.insert(where, 'Translation.language = "' .. lang .. '"')

    -- query:
    return mw.ext.cargo.query('SubSkill, Translation', table.concat(fields, ','), {
        join = 'SubSkill.id = Translation.target_id',
        where = table.concat(where, ' AND '),
        limit = 500
    })
end

------------------------------------------------------------------------------------------------------------------------
-- Folds various skill results from Cargo into a single table
------------------------------------------------------------------------------------------------------------------------
local function consolidateSkills(main, iconAndOffers, subs)
    local hub = {}
    for _, row in ipairs(main) do
        local id = row.id
        local variant = row.variant
        hub[id] = hub[id] or { id = id, ranks = {} }
        local entry = hub[id]
        if variant then
            entry.ranks[tonumber(variant)] = {
                name = row.name or '',
                description = row.description or '',
            }
        else
            entry.name = row.name
        end
    end
    for _, row in ipairs(iconAndOffers) do
        local id = row.id
        local entry = hub[id] or { ranks = {} }
        local rank = entry.ranks[tonumber(row.level)] or {}
        rank.icon = row.icon or ''
        local csv = row.offered_sub_skills
        local ids = csv and mw.text.split(csv, ',') or {}
        rank.subSkills = {}
        for _, subId in ipairs(ids) do
            table.insert(rank.subSkills, {
                id = subId
            })
        end
    end
    for _, row in ipairs(subs) do
        local id = row.id
        local parentId = row.parent_skill_id
        local entry = hub[parentId] or { ranks = {} }
        for _, rank in ipairs(entry.ranks) do
            local subSkills = rank.subSkills or {}
            local subSkill = findInArray(subSkills, id)
            if subSkill then
                subSkill.icon = row.icon
                subSkill.name = row.name
                subSkill.description = row.description
                break
            end
        end
    end
    return hub
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
-- Converts an array into a dictionary, where the array.value becomes dic.key and array.index becomes dic.value
------------------------------------------------------------------------------------------------------------------------
local function flipArray(array)
    local dic = {}
    for index, value in ipairs(array) do
        dic[value] = index
    end
    return dic
end
local ID_TO_ORDER = flipArray(ORDER)

------------------------------------------------------------------------------------------------------------------------
-- Decides the order between two skills.
------------------------------------------------------------------------------------------------------------------------
local function compareSkills(a, b)
    local rankA = ID_TO_ORDER[a.id] or 99
    local rankB = ID_TO_ORDER[b.id] or 99

    if rankA ~= rankB then
        return rankA < rankB
    end

    return a.name < b.name
end

------------------------------------------------------------------------------------------------------------------------
-- Moves punctuation outside the quotes
------------------------------------------------------------------------------------------------------------------------
local function repairPunctuation(text)
    local allQuotes = [=["„“”‘’«»「」『』]=]
    local punctuation = "%,%.%!%?"
    local pattern = "([" .. punctuation .. "])([" .. allQuotes .. "])"
    text = mw.ustring.gsub(text, pattern, "%2%1")
    return text
end

------------------------------------------------------------------------------------------------------------------------
-- Converts quoted text into wiki links
------------------------------------------------------------------------------------------------------------------------
local function replaceQuotesWithLinks(text, lang)
    local allQuotes = [=["„“”«»「」『』]=]
    local pattern = "([" .. allQuotes .. "])([^" .. allQuotes .. "]+)([" .. allQuotes .. "])"
    text = mw.ustring.gsub(text, pattern, "[[%2]]")

    local quotePairs = {
        { '‘', '’' }, -- English "smart" single quotes
    }
    if lang == 'ko' then
        table.insert(quotePairs, { "'", "'" }) -- we're checking for single quotes only in Korean
    end
    for _, pair in ipairs(quotePairs) do
        local openQuote = pair[1]
        local closeQuote = pair[2]
        local pairedPattern = openQuote .. "([^" .. closeQuote .. "]+)" .. closeQuote
        text = mw.ustring.gsub(text, pairedPattern, "[[%1]]")
    end

    return text
end

------------------------------------------------------------------------------------------------------------------------
-- Displays a single skill (icon+name+description)
------------------------------------------------------------------------------------------------------------------------
local function createSkill(target, class, size, lang)
    local root = mw.html.create('div'):addClass('box'):addClass(class)
    root:tag('div'):addClass('icon-container'):wikitext('[[File:' .. target.icon .. '.png|' .. size .. 'px]]')
    local textContainer = root:tag('div'):addClass('text-container')
    textContainer:tag('div'):addClass('box-name'):wikitext('<b>' .. target.name .. '</b>')

    -- Description:
    local description = target.description
    --description = hideTags(description)
    description = repairPunctuation(description)
    description = replaceQuotesWithLinks(description, lang)
    --description = restoreTags(description)
    textContainer:tag('div'):addClass('box-description'):wikitext(description)

    return root
end

------------------------------------------------------------------------------------------------------------------------
-- Displays the main content
------------------------------------------------------------------------------------------------------------------------
local function renderSkills(skills, words, lang)
    local root = mw.html.create()
    local currentCategory = nil
    local isAll = #skills > 1
    if not isAll then
        root:tag('h3'):addClass('group'):wikitext(words.wiki_skills_levels)
    end
    for _, group in ipairs(skills) do
        local id = group.id

        local category = CATEGORIES[id]
        if category and category ~= currentCategory then
            currentCategory = category
            if isAll then
                root:tag('h2'):addClass('category'):wikitext(words[category])
            end
        end

        local ranks = group.ranks or {}
        if isAll then
            root:tag('h3'):addClass('group'):wikitext('[[' .. group.name .. ']]')
        end

        for _, rank in ipairs(ranks) do
            root:node(createSkill(rank, 'rank', 64, lang))

            local subSkills = rank.subSkills or {}
            for _, subSkill in pairs(subSkills) do
                root:node(createSkill(subSkill, 'sub', 32, lang))
            end
        end
    end
    return tostring(root)
end

------------------------------------------------------------------------------------------------------------------------
-- Main public function
------------------------------------------------------------------------------------------------------------------------
function p.display(frame)
    --if 1 then
    --    return dump(frame)
    --end

    -- Args
    local args = frame.args
    local lang = args.lang or 'en'
    local skill = args.skill

    -- Language
    local words = translateIds(TRANSLATION_IDS, lang)

    -- Cargo
    local main = queryMain(lang, skill)
    if #main == 0 then
        return 'No skills found!'
    end
    local iconAndOffers = queryIconAndOffers(skill)
    local subs = querySubs(lang, skill)
    local hub = consolidateSkills(main, iconAndOffers, subs)
    local skills = flatten(hub);

    -- Various manipulations
    table.sort(skills, compareSkills)

    -- Content
    local markup = renderSkills(skills, words, lang)

    -- Output
    local styleTag = frame:extensionTag('templatestyles', '', { src = frame:getTitle() .. '/styles.css' })
    --return dump(skills)
    return styleTag .. markup
end

return p