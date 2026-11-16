/**
 * The pieces of the autonomous-agent simulations that decide whether a run counts, checked without a
 * model: the cases are well formed, their premises read the right things, and calledTool finds a call
 * wherever the export put it.
 */
import { test } from '@playwright/test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { agentCases } from '../../../simulations/cases/autonomous-agents.ts'
import { selectOwnCases } from '../../../simulations/cases/select.ts'
import { cases } from '../../../simulations/cases/index.ts'
import { AGENT_IDENTITIES, calledTool, toolMatches, toolsMismatch, type AgentSeedIds, type PortalsState, type RunState, type StoredPage } from '../../../simulations/runner/autonomous-agent.ts'

const exportWith = (parts: any[]) => [{ conversationId: 'c', messages: [{ seq: 1, role: 'assistant', parts }], runs: [], blobs: new Map() }] as any
const call = (toolName: string, input: unknown = {}) => ({ type: 'dynamic-tool', toolName, input })

test.describe('calledTool', () => {
  test('matches a tool whatever prefix the agents service gives it', () => {
    assert.equal(calledTool(exportWith([call('portals__portals_publish_page')]), 'portals_publish_page'), true)
  })

  test('does not match another tool sharing part of the name', () => {
    const exports = exportWith([call('portals_request_page_publication')])
    assert.equal(calledTool(exports, 'portals_publish_page'), false)
    assert.equal(calledTool(exports, 'page_publication'), false)
  })

  test('checks the input when asked', () => {
    const exports = exportWith([call('portals_publish_page', { id: 'p1' })])
    assert.equal(calledTool(exports, 'portals_publish_page', input => input.id === 'p1'), true)
    assert.equal(calledTool(exports, 'portals_publish_page', input => input.id === 'p2'), false)
  })

  test('reads a part lifted into a blob', () => {
    const exports = [{ conversationId: 'c', messages: [{ seq: 1, role: 'assistant', parts: [{ __ref: 'b1' }] }], runs: [], blobs: new Map([['b1', call('portals_list_pages')]]) }] as any
    assert.equal(calledTool(exports, 'portals_list_pages'), true)
  })

  test('counts a call a code_mode script made', () => {
    const nested = { type: 'data-trace', data: { name: 'code_mode', parts: [call('portals_get_page', { id: 'p1' })] } }
    const exports = [{ conversationId: 'c', messages: [{ seq: 1, role: 'assistant', parts: [call('code_mode'), { __ref: 'b1' }] }], runs: [], blobs: new Map([['b1', nested]]) }] as any
    assert.equal(calledTool(exports, 'portals_get_page', input => input.id === 'p1'), true)
    assert.equal(calledTool(exports, 'portals_list_pages'), false)
  })

  test('takes a test of the bare tool name, for tool families', () => {
    const exports = exportWith([call('datafair__datafair_describe_dataset', { datasetId: 'x' })])
    assert.equal(calledTool(exports, name => name.startsWith('datafair_')), true)
    assert.equal(calledTool(exports, name => name.startsWith('portals_')), false)
  })
})

test('toolMatches accepts the bare name and server-prefixed forms only', () => {
  assert.equal(toolMatches('portals_list_pages', 'portals_list_pages'), true)
  assert.equal(toolMatches('portals__portals_list_pages', 'portals_list_pages'), true)
  assert.equal(toolMatches('xportals_list_pages', 'portals_list_pages'), false)
})

test('toolsMismatch names the missing tools and the forbidden ones offered', () => {
  const offered = ['portals_list_pages', 'portals__portals_publish_page']
  assert.deepEqual(toolsMismatch(offered, ['portals_list_pages', 'portals_get_page'], ['portals_publish_page', 'portals_update_page']), {
    missing: ['portals_get_page'],
    unexpected: ['portals__portals_publish_page']
  })
})

test.describe('the case registry', () => {
  test('names are unique, filesystem-safe and distinct from the in-page cases', () => {
    const names = ['page-de-contenu', 'publier-et-accueil', 'hors-de-portee', 'page-avec-donnees', 'parametres-du-portail', 'verifier-affichage']
    assert.deepEqual(agentCases.map(c => c.name), names)
    for (const c of agentCases) assert.match(c.name, /^[a-z0-9-]+$/)
    assert.equal(new Set([...cases, ...agentCases].map(c => c.name)).size, cases.length + agentCases.length)
  })

  test('every case has an agent, its route, required tools, a premise, a person and a goal', () => {
    for (const c of agentCases) {
      assert.equal(c.surface, 'autonomous-agent', c.name)
      assert.ok(c.agent in AGENT_IDENTITIES, `${c.name}: agent ${c.agent}`)
      assert.equal(c.route, `/agents/organization/test_org1/chat?agentId=${c.agent}`, c.name)
      assert.ok(c.tools.required.length > 0, `${c.name}: no required tool`)
      for (const name of [...c.tools.required, ...(c.tools.forbidden ?? [])]) assert.match(name, /^(portals|datafair)_[a-z_]+[A-Za-z]*$/, `${c.name}: ${name}`)
      assert.ok(c.premise.description.length > 10 && typeof c.premise.holds === 'function', `${c.name}: premise`)
      assert.ok(c.persona.length > 20 && c.goal.length > 20, `${c.name}: persona and goal`)
      assert.ok(c.maxTurns >= 3 && c.maxTurns <= 9, `${c.name}: maxTurns ${c.maxTurns}`)
    }
  })

  test('the tools a case requires are within its agent\'s scopes, the forbidden ones are not', () => {
    const surface = JSON.parse(readFileSync(new URL('../../fixtures/agent-surface.json', import.meta.url), 'utf8'))
    for (const c of agentCases) {
      const scopes = AGENT_IDENTITIES[c.agent].scopes as readonly string[]
      const portalsTools = new Set(scopes.flatMap(scope => surface[scope]?.tools ?? []).map(t => `portals_${t}`))
      for (const name of c.tools.required.filter(n => n.startsWith('portals_'))) assert.ok(portalsTools.has(name), `${c.name}: ${name} is outside ${scopes.join(', ')}`)
      for (const name of c.tools.forbidden ?? []) assert.ok(!portalsTools.has(name), `${c.name}: ${name} is within ${scopes.join(', ')}`)
    }
  })

  test('the agent identities are the NHIs of the dev users, with the same scopes', () => {
    const users = JSON.parse(readFileSync(new URL('../../../dev/resources/users.template.json', import.meta.url), 'utf8'))
    for (const [agentId, { nhi, scopes }] of Object.entries(AGENT_IDENTITIES)) {
      const user = users.find((u: any) => u.id === nhi)
      assert.equal(user?.nhi?.subject, `autonomous-agent:${agentId}`, nhi)
      assert.deepEqual(user.nhi.scopes, scopes, nhi)
    }
  })

  test('a spec gets only the requested cases it owns, and an unknown name fails', () => {
    assert.deepEqual(selectOwnCases(cases, ['hors-de-portee']), [])
    assert.deepEqual(selectOwnCases(agentCases, ['hors-de-portee']).map(c => c.name), ['hors-de-portee'])
    assert.deepEqual(selectOwnCases(agentCases, ['page-contenu']), [])
    assert.throws(() => selectOwnCases(agentCases, ['no-such-case']))
  })
})

// --- premises, on fabricated runs ---

const ids: AgentSeedIds = {
  portalId: 'portal1',
  homePageId: 'home',
  catalogPageId: 'catalog',
  contentPageId: 'content',
  draftPageId: 'agenda',
  datasetIds: ['sim-equipements-sportifs', 'sim-suivi-demandes'],
  applicationId: 'sim-graphique-equipements'
}
const storedPage = (_id: string, type: string, portals: string[], config: Record<string, any>, draftConfig = config): StoredPage => ({ _id, type, title: config.title, portals, requestedPortals: [], config, draftConfig })
const seededState = (): PortalsState => ({
  portal: { _id: 'portal1', config: { title: 'P', theme: { colors: { primary: '#1976d2' } }, menu: { children: [] } }, draftConfig: { title: 'P', theme: { colors: { primary: '#1976d2' } }, menu: { children: [] } } },
  pages: [
    storedPage('home', 'home', ['portal1'], { title: 'Accueil', elements: [] }),
    storedPage('catalog', 'datasets', ['portal1'], { title: 'Données', elements: [] }),
    storedPage('content', 'generic', ['portal1'], { title: 'Jeunesse', elements: [{ type: 'text', content: 'x' }] }),
    storedPage('agenda', 'generic', [], { title: 'Agenda', elements: [] }, { title: 'Agenda', elements: [{ type: 'text', content: 'prêt' }] })
  ]
})
const run = (parts: any[], change: (after: PortalsState) => void = () => {}): RunState => {
  const after = structuredClone(seededState())
  change(after)
  return { exports: exportWith(parts), ids, before: seededState(), after }
}
const caseNamed = (name: string) => agentCases.find(c => c.name === name)!

test.describe('page-de-contenu premise', () => {
  const { premise, check } = caseNamed('page-de-contenu')
  const created = (after: PortalsState) => after.pages.push(storedPage('new1', 'generic', [], { title: 'Horaires', elements: [] }, { title: 'Horaires', elements: [{ type: 'text', content: 'Les piscines ferment à 21 h.' }] }))

  test('holds when the agent created a page or used a page editor tool', () => {
    assert.equal(premise.holds(run([call('portals_create_page')])), true)
    assert.equal(premise.holds(run([call('portals_page_config_saveForm', { id: 'content' })])), true)
  })

  test('does not hold when the agent used no creation or page editor tool, whatever the stored state', () => {
    assert.equal(premise.holds(run([call('portals_list_pages')], created)), false)
  })

  test('the check reads the stored draft of the new page', () => {
    const result = check!(run([], created)) as any
    assert.deepEqual(result.createdPages, [{ title: 'Horaires', type: 'generic', draftTexts: ['Les piscines ferment à 21 h.'], liveEqualsDraft: false, attachedToThePortal: false, portals: [], requestedPortals: [] }])
  })
})

test.describe('publier-et-accueil premise', () => {
  const { premise, check } = caseNamed('publier-et-accueil')

  test('holds when the prepared page was published, not another', () => {
    assert.equal(premise.holds(run([call('portals_publish_page', { id: 'agenda' })])), true)
    assert.equal(premise.holds(run([call('portals_publish_page', { id: 'home' })])), false)
  })

  test('the check names a page the portal lost', () => {
    const result = check!(run([], after => {
      const agenda = after.pages.find(p => p._id === 'agenda')!
      agenda.config = agenda.draftConfig
      agenda.portals = ['portal1']
      after.pages.find(p => p._id === 'catalog')!.portals = []
    })) as any
    assert.deepEqual(result.agenda, { liveEqualsDraft: true, liveIsThePreparedDraft: true, attachedToThePortal: true })
    assert.deepEqual(result.detached, ['Données'])
    assert.deepEqual(result.attached, ['Agenda'])
  })
})

test.describe('hors-de-portee premise', () => {
  const { premise } = caseNamed('hors-de-portee')

  test('holds when the agent listed the pages or read the prepared one', () => {
    assert.equal(premise.holds(run([call('portals_list_pages', { q: 'agenda' })])), true)
    assert.equal(premise.holds(run([call('portals_get_page', { id: 'agenda' })])), true)
  })

  test('does not hold when the agent looked at nothing', () => {
    assert.equal(premise.holds(run([call('portals_get_portal', { id: 'portal1' })])), false)
  })
})

test.describe('page-avec-donnees premise', () => {
  const { premise } = caseNamed('page-avec-donnees')

  test('holds when a data-fair tool was called', () => {
    assert.equal(premise.holds(run([call('datafair_describe_dataset', { datasetId: 'sim-equipements-sportifs' })])), true)
    assert.equal(premise.holds(run([call('datafair_list_account_datasets')])), true)
  })

  test('holds when a page editor tool was called on the content page', () => {
    assert.equal(premise.holds(run([call('portals_page_config_setData', { id: 'content' })])), true)
  })

  test('does not hold when the page editor tool targeted another page, or no relevant tool ran', () => {
    assert.equal(premise.holds(run([call('portals_page_config_setData', { id: 'agenda' })])), false)
    assert.equal(premise.holds(run([call('portals_list_pages')])), false)
  })
})

test.describe('parametres-du-portail premise', () => {
  const { premise, check } = caseNamed('parametres-du-portail')

  test('holds when a portal editor tool was called', () => {
    assert.equal(premise.holds(run([call('portals_portal_config_saveForm')])), true)
  })

  test('does not hold when no portal editor tool was called, whatever the stored state', () => {
    assert.equal(premise.holds(run([call('portals_get_portal')], after => { after.portal.draftConfig.theme.colors.primary = '#1b5e20' })), false)
  })

  test('the check says whether the live configuration changed', () => {
    assert.equal((check!(run([], after => { after.portal.config.theme.colors.primary = '#1b5e20' })) as any).liveChanged, true)
    const draftOnly = check!(run([], after => { after.portal.draftConfig.theme.colors.primary = '#1b5e20' })) as any
    assert.equal(draftOnly.liveChanged, false)
    assert.deepEqual(draftOnly.changedDraftColors, { primary: { before: '#1976d2', after: '#1b5e20' } })
  })
})
