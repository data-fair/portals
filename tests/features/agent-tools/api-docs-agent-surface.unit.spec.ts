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
const editorTools = (name: string) => editorVerbs.map(verb => `${name}_${verb}`)

const loadSurface = (options: Parameters<typeof load>[1] = {}) => load(apiDocs('en'), { baseUrl, files: FILES, lint: 'error', ...options })

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
    for (const name of ['update_page', 'create_page', 'cancel_page_draft', ...editorTools('page_config')]) assert.ok(pagesWrite.includes(name), name)
    for (const name of ['publish_page', 'attach_page_to_portals', 'request_page_publication', 'transfer_page', 'create_page_on_portals', 'delete_page']) {
      assert.ok(!pagesWrite.includes(name), name)
      assert.ok(names(['pages:admin']).includes(name), name)
    }
    const portalsWrite = names(['portals:write'])
    assert.ok(portalsWrite.includes('portal_config_saveForm'))
    for (const name of ['publish_portal_config', 'update_portal_settings', 'create_portal']) assert.ok(!portalsWrite.includes(name), name)
    assert.ok(names(['reuses:write']).includes('update_reuse'))
    for (const name of ['publish_reuse', 'attach_reuse_to_portals', 'submit_reuse']) assert.ok(!names(['reuses:write']).includes(name), name)
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
      const plain = toolSet.tools.filter(t => !editorVerbs.some(verb => t.name.endsWith(`_${verb}`)))
      assert.deepEqual(plain.filter(t => !t.title).map(t => t.name), [], `untitled in ${locale}`)
      const titles = plain.map(t => t.title)
      assert.equal(new Set(titles).size, titles.length, `two tools share a title in ${locale}`)
    }
  })

  test('descriptions name the tools by their platform names', async () => {
    // data-fair prefixes every tool of this document with portals_: a text naming `publish_page`
    // sends the agent to a tool that does not exist in the platform document
    const toolSet = await loadSurface()
    const baseNames = toolSet.tools.map(t => t.name)
    const unprefixed = new RegExp(`(?<![A-Za-z0-9_])(${baseNames.join('|')})(?![A-Za-z0-9_])`, 'g')
    // the editor tools' own texts come from @json-layout/agents, named with their prefix as loaded
    const authored = toolSet.tools.filter(t => !editorVerbs.some(verb => t.name.endsWith(`_${verb}`)))
    const found = authored.flatMap(t => [...JSON.stringify({ description: t.description, inputSchema: t.inputSchema }).matchAll(unprefixed)].map(m => `${t.name}: ${m[1]}`))
    assert.deepEqual(found, [])
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
      assert.match(await call('page_config_getData', { id: 'p1', path: '/title' }), /A page/)
      assert.match(await call('page_config_describeState', { id: 'p1' }), /elements/)
      assert.match(await call('portal_config_getData', { id: 'x1', path: '/title' }), /A portal/)
      assert.match(await call('portal_config_describeState', { id: 'x1' }), /theme/)
    } finally {
      Object.assign(console, { error, warn })
    }
    for (const message of logged) assert.match(message, /unknown component \\"markdown\\"|error fetching items .*\/topics/)
    assert.deepEqual(requested.filter(r => r.endsWith('/schema')), ['GET /pages/p1/draft-config/schema', 'GET /portals/x1/draft-config/schema'])
  })
})
