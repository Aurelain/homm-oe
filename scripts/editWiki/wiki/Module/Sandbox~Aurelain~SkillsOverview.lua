-- Usage: {{#invoke:SkillsOverview|display|lang=en}}
local p = {}

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
    table.insert(where, 'Translation.variant IS NOT NULL')

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
        hub[id] = hub[id] or {}
        local entry = hub[id]
        entry[row.variant] = {
            name = row.name or '',
            description = row.description or '',
        }
    end
    for _, row in ipairs(iconAndOffers) do
        local id = row.id
        local entry = hub[id] or {}
        local about = entry[row.level] or {}
        about.icon = row.icon or ''
        local csv = row.offered_sub_skills
        local ids = csv and mw.text.split(csv, ',') or {}
        about.subSkills = {}
        for _, subId in ipairs(ids) do
            about.subSkills[subId] = {}
        end
    end
    for _, row in ipairs(subs) do
        local id = row.id
        local parentId = row.parent_skill_id
        local entry = hub[parentId] or {}
        for _, about in pairs(entry) do
            local subSkills = about.subSkills or {}
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
-- Displays the content
------------------------------------------------------------------------------------------------------------------------
local function renderSkills(skills)
    local root = mw.html.create()
    for id, groupData in pairs(skills) do
        local group = mw.html.create('div'):addClass('group'):wikitext(id)
        root:node(group)
        for _, skillData in pairs(groupData) do
            local skill = mw.html.create('div'):addClass('skill'):wikitext(skillData.name)
            group:node(skill)
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

    -- Table
    local markup = renderSkills(skills)

    -- Output
    local styleTag = frame:extensionTag('templatestyles', '', { src = frame:getTitle() .. '/styles.css' })
    --return dump(skills)
    return styleTag .. markup
end

return p
