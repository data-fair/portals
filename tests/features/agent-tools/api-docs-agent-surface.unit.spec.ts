/**
 * The agent-facing surface of the portals manager: what `@data-fair/openapi-mcp` builds from the
 * x-agent annotations of api/contract/api-docs.ts, and the tools and skills each scope set reaches
 * through `toolsForScopes`. data-fair merges the document into its platform document, where every
 * name gets the `portals_` prefix. `lint: 'error'` refuses an invalid annotation or a description
 * that contradicts its schema; the golden turns any change of the surface into a diff a reviewer
 * sees. Regenerate with UPDATE_AGENT_SURFACE=1 when the change is intended.
 */
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { load, toolsForScopes, type ToolSet } from '@data-fair/openapi-mcp'
import apiDocs from '../../../api/contract/api-docs.ts'
import { readAgentSkill } from '../../../api/contract/agent-skills.ts'

const goldenPath = path.resolve(import.meta.dirname, '../../fixtures/agent-surface.json')
const baseUrl = 'http://portals.test/portals-manager/api'
/** A file store, as the MCP server is configured once the agents service has one: the upload tools exist only then. */
const FILES = { urlPrefixes: ['https://files.example.test/agent-files/'] }

const scopeSets: Record<string, string[] | undefined> = {
  unscoped: undefined,
  none: [],
  'portals:read': ['portals:read'],
  'portals:write': ['portals:write'],
  'portals:admin': ['portals:admin'],
  'pages:read': ['pages:read'],
  'pages:write': ['pages:write'],
  'pages:admin': ['pages:admin'],
  'reuses:read': ['reuses:read'],
  'reuses:write': ['reuses:write'],
  'reuses:admin': ['reuses:admin'],
  'all:read': ['all:read'],
  'all:admin': ['all:admin']
}

const editorVerbs = ['describeState', 'getData', 'setFieldValue', 'setData', 'getFieldSuggestions', 'editArray', 'saveForm', 'reloadForm']
/** openapi-mcp's form tools: one group for the page_config and portal_config forms, the form chosen per call */
const formTools = editorVerbs.map(verb => `form_${verb}`)
const isFormTool = (name: string) => name.startsWith('form_')

/** Reads the linked skill bodies as the API serves them at /api/agents/skills/<name>.md. */
const skillBodies = async (url: string) => {
  const prefix = `${baseUrl}/agents/skills/`
  const body = url.startsWith(prefix) && url.endsWith('.md') ? readAgentSkill(url.slice(prefix.length, -3)) : undefined
  return body ? { text: body } : { error: `not served: ${url}` }
}

/**
 * The names a text gets wrong for the platform document, where data-fair merges this one: the plain tools
 * are prefixed with portals_ (a text naming `publish_page` sends the agent to a tool that does not exist).
 * The form tools are not: the mcp server builds them from the merged document, so they keep their bare
 * names (form_saveForm) and their forms take the merged names (form "portals_page_config").
 */
const wrongPlatformNames = (toolSet: ToolSet, text: string) => {
  const plain = toolSet.tools.map(t => t.name).filter(name => !isFormTool(name))
  const forms: string[] = toolSet.tools.find(t => t.name === 'form_saveForm')!.inputSchema.properties.form.enum
  const known = new Set([...plain, ...forms].map(name => `portals_${name}`))
  const unprefixed = new RegExp(`(?<![A-Za-z0-9_])(${plain.join('|')})(?![A-Za-z0-9_])`, 'g')
  return [
    ...[...text.matchAll(unprefixed)].map(m => `unprefixed ${m[1]}`),
    ...[...text.matchAll(/(?<![A-Za-z0-9_])portals_[A-Za-z0-9_]+/g)].map(m => m[0]).filter(name => !known.has(name)).map(name => `unknown ${name}`),
    ...[...text.matchAll(/(?<![A-Za-z0-9_])form_[A-Za-z0-9_]+/g)].map(m => m[0]).filter(name => !formTools.includes(name)).map(name => `unknown ${name}`),
    ...[...text.matchAll(/form \\?"([A-Za-z0-9_]+)\\?"/g)].map(m => m[1]).filter(name => !known.has(name)).map(name => `form "${name}" is not a platform form name`)
  ]
}

const loadSurface = (options: Parameters<typeof load>[1] = {}) => load(apiDocs('en'), { baseUrl, files: FILES, lint: 'error', skillBodies, ...options })

const surface = (toolSet: ToolSet) => Object.fromEntries(Object.entries(scopeSets).map(([key, scopes]) => {
  const kept = toolsForScopes(toolSet, scopes)
  return [key, { tools: kept.tools.map(t => t.name).sort(), skills: kept.skills.map(s => s.name).sort() }]
}))

test.describe('agent surface of the api docs', () => {
  test('loads without a lint error and matches its golden', async () => {
    const toolSet = await loadSurface()
    const names = toolSet.tools.map(t => t.name)
    assert.equal(new Set(names).size, names.length, 'no name twice')
    const snapshot = surface(toolSet)
    if (process.env.UPDATE_AGENT_SURFACE) writeFileSync(goldenPath, JSON.stringify(snapshot, null, 2) + '\n')
    assert.deepEqual(snapshot, JSON.parse(readFileSync(goldenPath, 'utf8')))
  })

  test('a write token edits drafts, the admin tier publishes and attaches to portals', async () => {
    const toolSet = await loadSurface()
    const names = (scopes: string[]) => toolsForScopes(toolSet, scopes).tools.map(t => t.name)
    const pagesWrite = names(['pages:write'])
    for (const name of ['create_page', 'cancel_page_draft', 'update_group', ...formTools]) assert.ok(pagesWrite.includes(name), name)
    for (const name of ['publish_page', 'update_page_settings', 'delete_page']) {
      assert.ok(!pagesWrite.includes(name), name)
      assert.ok(names(['pages:admin']).includes(name), name)
    }
    const portalsWrite = names(['portals:write'])
    assert.ok(portalsWrite.includes('form_saveForm'))
    for (const name of ['publish_portal_config', 'update_portal_settings', 'create_portal']) assert.ok(!portalsWrite.includes(name), name)
    assert.ok(names(['reuses:write']).includes('update_reuse'))
    for (const name of ['publish_reuse', 'update_reuse_settings', 'submit_reuse']) assert.ok(!names(['reuses:write']).includes(name), name)
    assert.deepEqual(names(['pages:admin']).filter(name => name.startsWith('portal')), [], 'no portal tool for a pages token')
  })

  test('a global tier scope reaches the tools of every family at its tier', async () => {
    const toolSet = await loadSurface()
    const names = (scopes: string[]) => toolsForScopes(toolSet, scopes).tools.map(t => t.name).sort()
    for (const tier of ['read', 'write', 'admin']) {
      assert.deepEqual(names([`all:${tier}`]), names([`portals:${tier}`, `pages:${tier}`, `reuses:${tier}`]), tier)
    }
    assert.deepEqual(names(['all:admin']), toolSet.tools.map(t => t.name).sort())
  })

  test('every tool has a title in French and in English', async () => {
    for (const locale of ['fr', 'en']) {
      const toolSet = await load(apiDocs(locale as 'fr' | 'en'), { baseUrl, files: FILES, locale })
      const plain = toolSet.tools.filter(t => !isFormTool(t.name))
      assert.deepEqual(plain.filter(t => !t.title).map(t => t.name), [], `untitled in ${locale}`)
      const titles = plain.map(t => t.title)
      assert.equal(new Set(titles).size, titles.length, `two tools share a title in ${locale}`)
    }
  })

  test('member-written resources are closed world, reuses and the page preview stay open', async () => {
    const toolSet = await loadSurface()
    const openWorld = (name: string) => toolSet.tools.find(t => t.name === name)?.annotations?.openWorldHint
    for (const name of ['list_portals', 'get_portal', 'list_pages', 'get_page', 'create_page', 'publish_page', 'upload_image', 'form_getData', 'form_saveForm']) {
      assert.equal(openWorld(name), false, name)
    }
    // submitted by a portal's users from other accounts
    for (const name of ['list_reuses', 'get_reuse']) assert.notEqual(openWorld(name), false, name)
    assert.equal(openWorld('preview_portal_page'), true)
  })

  test('the form tools serve both forms, narrowed to the one form a token is granted', async () => {
    const toolSet = await loadSurface()
    const formTool = (scopes: string[] | undefined, name: string) => toolsForScopes(toolSet, scopes).tools.find(t => t.name === name)
    const forms = (scopes: string[] | undefined) => formTool(scopes, 'form_saveForm')?.inputSchema.properties.form.enum
    for (const scopes of [undefined, ['all:write'], ['pages:write', 'portals:write']]) assert.deepEqual(forms(scopes), ['portal_config', 'page_config'], String(scopes))
    for (const scopes of [['pages:write'], ['pages:admin']]) assert.deepEqual(forms(scopes), ['page_config'], scopes.join())
    for (const scopes of [['portals:write'], ['portals:admin']]) assert.deepEqual(forms(scopes), ['portal_config'], scopes.join())
    for (const scopes of [['pages:read'], ['portals:read'], ['reuses:admin']]) {
      assert.deepEqual(toolsForScopes(toolSet, scopes).tools.filter(t => isFormTool(t.name)).map(t => t.name), [], scopes.join())
    }
    const unscoped = formTool(undefined, 'form_setFieldValue')!
    assert.deepEqual(unscoped.inputSchema.required.slice(0, 2), ['form', 'id'])
    // the form tools' titles, an approval card's heading: the form's title and the verb while one form is offered
    const title = (scopes: string[] | undefined, name: string) => formTool(scopes, name)?.annotations?.title
    assert.equal(title(undefined, 'form_saveForm'), 'Form — save')
    assert.equal(title(['pages:write'], 'form_saveForm'), 'Page draft content (not live until published) — save')
    assert.equal(title(['portals:write'], 'form_setFieldValue'), 'Portal draft configuration (not live until published) — set a field')
    assert.equal(formTool(['pages:write'], 'form_setFieldValue')!.inputSchema.properties.id.description, 'Id of the page.')
  })

  test('the page preview is a read tool returning the screenshot as an image and the report as text', async () => {
    const toolSet = await loadSurface()
    const preview = toolSet.tools.find(t => t.name === 'preview_portal_page')!
    assert.ok(preview)
    assert.equal(preview.annotations?.readOnlyHint, true)
    assert.equal(preview.annotations?.openWorldHint, true)
    assert.deepEqual(Object.keys(preview.inputSchema.properties).sort(), ['draft', 'fullPage', 'id', 'portal', 'viewport'])
    const names = (scopes: string[]) => toolsForScopes(toolSet, scopes).tools.map(t => t.name)
    assert.ok(names(['pages:read']).includes('preview_portal_page'))
    for (const scopes of [['portals:admin'], ['reuses:admin']]) assert.ok(!names(scopes).includes('preview_portal_page'), scopes.join())
    assert.match(preview.description, /not fetch_url/)
    assert.match(preview.description, /\(form_saveForm\)/)
  })

  test('descriptions name the tools by their platform names', async () => {
    const toolSet = await loadSurface()
    // the form tools' own texts come from openapi-mcp and @json-layout/agents, named as loaded
    const authored = toolSet.tools.filter(t => !isFormTool(t.name))
    const found = authored.flatMap(t => wrongPlatformNames(toolSet, JSON.stringify({ description: t.description, inputSchema: t.inputSchema })).map(name => `${t.name}: ${name}`))
    assert.deepEqual(found, [])
  })

  test('the pages and config skills are read and follow the scopes', async () => {
    const toolSet = await loadSurface()
    for (const name of ['pages', 'config']) {
      const skill = toolSet.skills.find(s => s.name === name)
      assert.ok(skill, name)
      assert.equal(skill.error, undefined, `${name}: its linked body is read`)
      assert.ok(skill.description.length <= 1024, `${name}: description too long`)
      assert.ok(Buffer.byteLength(skill.body) < 25_000, `${name}: body too long`)
    }
    const skills = (scopes: string[]) => toolsForScopes(toolSet, scopes).skills.map(s => s.name)
    assert.ok(skills(['pages:read']).includes('pages'))
    assert.ok(!skills(['pages:read']).includes('config'))
    assert.ok(skills(['portals:read']).includes('config'))
    assert.ok(!skills(['portals:read']).includes('pages'))
    for (const scopes of [['reuses:write'], ['pages:write']]) assert.ok(!skills(scopes).includes('config'), scopes.join())
    // openapi-mcp's form skill (served as form in the platform too) goes with the form tools, not with a business skill
    for (const scopes of [['pages:write'], ['portals:write']]) assert.ok(skills(scopes).includes('form'), scopes.join())
    for (const scopes of [['pages:read'], ['portals:read'], ['reuses:admin']]) assert.ok(!skills(scopes).includes('form'), scopes.join())
    assert.ok(!skills(['portals:write']).includes('pages'), 'a portal-config token is not offered the pages skill')
    assert.ok(!skills(['pages:write']).includes('config'), 'a page-config token is not offered the config skill')
  })

  test('skill bodies name existing tools by their platform names', async () => {
    const toolSet = await loadSurface()
    for (const skill of toolSet.skills.filter(s => ['pages', 'config'].includes(s.name))) {
      const text = skill.description + '\n' + skill.body.replace(/\n\nTools: .*$/, '')
      assert.deepEqual(wrongPlatformNames(toolSet, text), [], skill.name)
    }
  })

  test('the upload tools take a file URL, and are not offered without a file store', async () => {
    const toolSet = await loadSurface()
    const tool = (name: string) => toolSet.tools.find(t => t.name === name)!
    const image = tool('upload_image')
    assert.deepEqual(image.inputSchema.required, ['body', 'image'])
    assert.ok(image.inputSchema.properties.image['x-mcp-file'])
    assert.ok(tool('upload_font_asset').inputSchema.properties['font-asset']['x-mcp-file'])
    const withoutStore = (await loadSurface({ files: undefined })).tools.map(t => t.name)
    for (const name of ['upload_image', 'upload_font_asset']) assert.ok(!withoutStore.includes(name), name)
  })

  test('the page_config and portal_config editors compile the served schemas', async () => {
    test.slow()
    const { pageConfigSchema, portalConfigSchema } = await import('../../../api/src/draft-configs/service.ts')
    const owner = { type: 'organization', id: 'test_org1', name: 'Test org' }
    const served: Record<string, unknown> = {
      '/pages/p1/draft-config/schema': await pageConfigSchema('generic'),
      '/pages/p1/draft-config': { title: 'A page', elements: [], genericMetadata: { slug: 'a-page' } },
      '/portals/x1/draft-config/schema': await portalConfigSchema({ owner, whiteLabel: false }),
      '/portals/x1/draft-config': { title: 'A portal' }
    }
    const requested: string[] = []
    const fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init)
      const pathname = new URL(request.url).pathname.replace('/portals-manager/api', '')
      requested.push(`${request.method} ${pathname}`)
      const body = served[pathname]
      return body ? Response.json(body) : new Response('not found', { status: 404 })
    }) as typeof globalThis.fetch
    const toolSet = await loadSurface({ fetch })
    const call = async (name: string, params: Record<string, unknown>) => {
      const result = await toolSet.tools.find(t => t.name === name)!.execute(params)
      assert.ok(!result.isError, `${name}: ${result.text}`)
      return result.text
    }
    // json-layout compiles without the vjsf markdown plugin (its fields fall back to the default
    // component) and the portal form fetches the topics of its owner from data-fair, not served here
    const logged: string[] = []
    const { error, warn } = console
    console.error = console.warn = (...args: unknown[]) => { logged.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')) }
    try {
      assert.match(await call('form_getData', { form: 'page_config', id: 'p1', path: '/title' }), /A page/)
      assert.match(await call('form_describeState', { form: 'page_config', id: 'p1' }), /elements/)
      assert.match(await call('form_getData', { form: 'portal_config', id: 'x1', path: '/title' }), /A portal/)
      assert.match(await call('form_describeState', { form: 'portal_config', id: 'x1' }), /theme/)
    } finally {
      Object.assign(console, { error, warn })
    }
    for (const message of logged) assert.match(message, /unknown component \\"markdown\\"|error fetching items .*\/topics/)
    assert.deepEqual(requested.filter(r => r.endsWith('/schema')), ['GET /pages/p1/draft-config/schema', 'GET /portals/x1/draft-config/schema'])
  })
})
