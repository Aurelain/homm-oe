-- Usage: {{#invoke:SkillsOverview|display|lang=en}}
local p = {}

------------------------------------------------------------------------------------------------------------------------
-- Displays a variable
------------------------------------------------------------------------------------------------------------------------
local function dump(target)
    return '<pre>' .. mw.dumpObject(target) .. '</pre>'
end

------------------------------------------------------------------------------------------------------------------------
-- Retrieves the most important data from Cargo
------------------------------------------------------------------------------------------------------------------------
local function queryMain(lang, forcedSkill)
    local tables = 'Skill, Translation'
    local fields = '' ..
        'Skill.id = id,' ..
        'Translation.variant = variant,' ..
        'Translation.name = name,' ..
        'Translation.description = description'
    local where = {}
    if forcedSkill then
        table.insert(where, 'Skill.school="' .. forcedSkill .. '"') -- TODO
    end
    table.insert(where, 'Skill.variant = "production"')
    table.insert(where, 'Translation.language = "' .. lang .. '"')
    table.insert(where, 'Translation.variant IS NOT NULL')
    local cargoArgs = {
        join = 'Skill.id = Translation.target_id',
        where = table.concat(where, ' AND '),
        limit = 1000
    }
    return mw.ext.cargo.query(tables, fields, cargoArgs)
end

------------------------------------------------------------------------------------------------------------------------
-- Retrieves the most important data from Cargo
------------------------------------------------------------------------------------------------------------------------
local function querySubs(lang, forcedSkill)
    local tables = 'SubSkill, Translation'
    local fields = '' ..
        'SubSkill.id = id,' ..
        'SubSkill.parent_skill_id = parent_skill_id,' ..
        'SubSkill.icon = icon,' ..
        'Translation.name = name,' ..
        'Translation.description = description'
    local where = {}
    if forcedSkill then
        table.insert(where, 'Skill.school="' .. forcedSkill .. '"') -- TODO
    end
    table.insert(where, 'SubSkill.variant = "production"')
    table.insert(where, 'Translation.language = "' .. lang .. '"')
    --table.insert(where, 'Translation.variant IS NOT NULL')
    local cargoArgs = {
        join = 'SubSkill.id = Translation.target_id',
        where = table.concat(where, ' AND '),
        limit = 1000
    }
    return mw.ext.cargo.query(tables, fields, cargoArgs)
end

------------------------------------------------------------------------------------------------------------------------
-- Main public function
------------------------------------------------------------------------------------------------------------------------
function p.display(frame)
    -- Args
    local args = frame.args
    local lang = args.lang or 'en'

    -- Cargo
    local main = queryMain(lang, args.skill)
    --local subs = querySubs(lang, args.skill)

    -- Table
    local htmlTable = mw.html.create('table')
    htmlTable:addClass('wikitable sortable table-nobands')


    -- Output
    local styleTag = frame:extensionTag('templatestyles', '', { src = frame:getTitle() .. '/styles.css' })
    return dump(main)
    --return styleTag .. tostring(htmlTable)
end

return p