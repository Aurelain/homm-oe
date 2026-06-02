-- Usage: {{#invoke:SkillsOverview|display|lang=en}}
local p = {}
local ICONS = {
    '',
    'Advanced_',
    'Expert_',
}
------------------------------------------------------------------------------------------------------------------------
-- Debugs a variable
------------------------------------------------------------------------------------------------------------------------
local function dump(target)
    return '<pre>' .. mw.dumpObject(target) .. '</pre>'
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
        hub[id] = hub[id] or { ranks = {} }
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
            rank.subSkills[subId] = {}
        end
    end
    for _, row in ipairs(subs) do
        local id = row.id
        local parentId = row.parent_skill_id
        local entry = hub[parentId] or { ranks = {} }
        for _, rank in ipairs(entry.ranks) do
            local subSkills = rank.subSkills or {}
            if subSkills[id] then
                subSkills[id].icon = row.icon
                subSkills[id].name = row.name
                subSkills[id].description = row.description
                break
            end
        end
    end
    return hub
end

------------------------------------------------------------------------------------------------------------------------
-- Displays a single skill (icon+name+description)
------------------------------------------------------------------------------------------------------------------------
local function wrapQuotes(str)
    if not str then return nil end
    --local result = string.gsub(str, '"([^"]+)"', '[[%1]]')
    local result = string.gsub(str, "“_*(.-)_*”", "[[%1]]")
    return result
end

------------------------------------------------------------------------------------------------------------------------
-- Displays a single skill (icon+name+description)
------------------------------------------------------------------------------------------------------------------------
local function createSkill(target, size)
    local root = mw.html.create('div'):addClass('box')
    root:tag('div'):addClass('icon-container'):wikitext('[[File:' .. target.icon .. '.png|' .. size .. 'px]]')
    local textContainer = root:tag('div'):addClass('text-container')
    textContainer:tag('div'):addClass('box-name'):wikitext('<b>' .. target.name .. '</b>')
    textContainer:tag('div'):addClass('box-description'):wikitext(wrapQuotes(target.description))
    return root
end

------------------------------------------------------------------------------------------------------------------------
-- Displays the main content
------------------------------------------------------------------------------------------------------------------------
local function renderSkills(skills)
    local root = mw.html.create()
    for id, group in pairs(skills) do
        --root:tag('h2'):addClass('group'):wikitext(group.name)

        local ranks = group.ranks or {}
        for n, rank in ipairs(ranks) do

            root:node(createSkill(rank, 64))

            local sub = root:tag('div'):addClass('sub')

            local subSkills = rank.subSkills or {}
            for _, subSkill in pairs(subSkills) do

                sub:node(createSkill(subSkill, 32))
            end
        end
    end
    return tostring(root)
end

------------------------------------------------------------------------------------------------------------------------
-- Main public function
------------------------------------------------------------------------------------------------------------------------
function p.display(frame)
    -- Args
    local args = frame.args
    local lang = args.lang or 'en'
    local skill = args.skill

    -- Cargo
    local main = queryMain(lang, skill)
    if #main == 0 then
        return 'Cannot find skill "' .. skill .. '"'
    end
    local iconAndOffers = queryIconAndOffers(skill)
    local subs = querySubs(lang, skill)
    local skills = consolidateSkills(main, iconAndOffers, subs)

    skills.skill_assault.ranks[1].icon = 'Skill_Offence'
    skills.skill_assault.ranks[2].icon = 'Skill_Advanced_Offence'
    skills.skill_assault.ranks[2].subSkills.sub_skill_assault_2.icon = 'Offense_sub_archery'
    skills.skill_assault.ranks[2].subSkills.sub_skill_assault_3.icon = 'Offense_sub_battle_march'
    skills.skill_assault.ranks[2].subSkills.sub_skill_assault_6.icon = 'Offense_sub_battle_frenzy'
    skills.skill_assault.ranks[3].icon = 'Skill_Expert_Offence'
    skills.skill_assault.ranks[3].subSkills.sub_skill_assault_1.icon = 'Offense_sub_shadow_blades'
    skills.skill_assault.ranks[3].subSkills.sub_skill_assault_4.icon = 'Offense_sub_reality_wardens'
    skills.skill_assault.ranks[3].subSkills.sub_skill_assault_5.icon = 'Defense_sub_firmness'

    local t = skills.skill_assault.ranks[3].subSkills.sub_skill_assault_4.description
    skills.skill_assault.ranks[3].subSkills.sub_skill_assault_4.description = string.gsub(t, ".”", "”.")
    t = skills.skill_assault.ranks[2].subSkills.sub_skill_assault_3.description
    skills.skill_assault.ranks[2].subSkills.sub_skill_assault_3.description = string.gsub(t, ".”", "”.")
    -- Table
    local markup = renderSkills(skills)

    -- Output
    local styleTag = frame:extensionTag('templatestyles', '', { src = frame:getTitle() .. '/styles.css' })
    --return dump(skills)
    return styleTag .. markup
end

return p
