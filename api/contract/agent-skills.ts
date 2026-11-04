/**
 * The skill bodies of the document's `x-agent.skills` (x-agent.ts): markdown files in ./agent-skills,
 * served at /portals-manager/api/agents/skills/<name>.md and linked by `href` (relative to the
 * document URL, /portals-manager/api/api-docs.json). Read once: they ship with the code.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const dir = path.join(import.meta.dirname, 'agent-skills')
const skills = new Map(readdirSync(dir)
  .filter(file => /^[a-z0-9-]+\.md$/.test(file))
  .map(file => [file.slice(0, -3), readFileSync(path.join(dir, file), 'utf8')]))

/** The markdown body of a skill, or undefined for a name that is not one of the files. */
export const readAgentSkill = (name: string): string | undefined => skills.get(name)
