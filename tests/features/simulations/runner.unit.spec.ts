import { test, expect } from '@playwright/test'
import { errorsInSseBody, errorsInResponse } from '../../../simulations/runner/gateway-errors.ts'
import { bridgeSettings, MODEL_ROLES } from '../../../simulations/runner/settings.ts'
import { passActions, withSilentPasses } from '../../../simulations/runner/silent-passes.ts'

test.describe('simulation runner helpers', () => {
  test('errorsInSseBody keeps only error chunks', () => {
    const body = [
      'data: {"choices":[{"delta":{"content":"Bonjour"}}]}',
      'data: not json',
      'data: {"error":{"message":"rate limited"}}',
      'data: [DONE]'
    ].join('\n')
    expect(errorsInSseBody(body)).toEqual(['rate limited'])
  })

  test('errorsInResponse reads a quota refusal', () => {
    expect(errorsInResponse(429, '{"reason":"credits exhausted"}')).toEqual(['HTTP 429: credits exhausted'])
    expect(errorsInResponse(500, 'oops')).toEqual(['HTTP 500'])
    expect(errorsInResponse(200, 'data: {"choices":[]}')).toEqual([])
  })

  test('errorsInResponse leaves auth refusals to the judge', () => {
    // The agents service refusing a visitor (e.g. an anonymous action token not yet
    // valid) is product behaviour the person sees, not a provider failure.
    expect(errorsInResponse(401, '{"reason":"anonymous action token not yet valid"}')).toEqual([])
    expect(errorsInResponse(403, 'forbidden')).toEqual([])
  })

  test('bridgeSettings maps background roles to the tools model', () => {
    const { superadmin, org } = bridgeSettings('sonnet', 'haiku')
    expect(Object.keys(org.modelMapping).sort()).toEqual([...MODEL_ROLES].sort())
    expect(org.modelMapping.assistant.id).toBe('sonnet')
    expect(org.modelMapping.evaluator.id).toBe('sonnet')
    expect(org.modelMapping.tools.id).toBe('haiku')
    expect(org.modelMapping.summarizer.id).toBe('haiku')
    expect(org.modelMapping.moderator.id).toBe('haiku')
    expect(superadmin.models.map(m => m.model.id).sort()).toEqual(['haiku', 'sonnet'])
    // portal visitors are anonymous: their quota must not be 0/limited
    expect(org.quotas.anonymous.unlimited).toBe(true)
    expect(superadmin.providers[0].compatibility).toBe('compatible')
  })

  test('bridgeSettings with one model declares it once', () => {
    const { superadmin } = bridgeSettings('sonnet', 'sonnet')
    expect(superadmin.models).toHaveLength(1)
    expect(superadmin.models[0].usage.sort()).toEqual([...MODEL_ROLES].sort())
  })

  // A judged run: the person clicked « Valider le brouillon » in the pass that resolved the
  // assistant's wait, the message they wrote then was dropped, and the next pass read a
  // conversation where the assistant validated with nothing from them in between. They told
  // it « Vous avez validé à ma place ».
  test('passActions names what the person did in one pass, not what they looked at', () => {
    const observations = [
      { turn: 1, tool: 'click', args: { name: 'Apparence' }, result: 'clicked "Apparence"' },
      { turn: 2, tool: 'look', args: {}, result: '…' },
      { turn: 2, tool: 'click', args: { name: 'Valider le brouillon' }, result: 'clicked "Valider le brouillon"' },
      { turn: 2, tool: 'type', args: { name: 'Titre', text: 'Agenda' }, result: 'typed' },
      { turn: 2, tool: 'screenshot', args: {}, result: 'screenshot of tab 1' }
    ]
    expect(passActions(observations, 2)).toEqual(['clicked "Valider le brouillon"', 'typed "Agenda" into "Titre"'])
  })

  test('withSilentPasses puts what the person did where they did it', () => {
    const conversation = [
      { role: 'user', text: 'Mets le portail en vert' },
      { role: 'assistant', text: 'Vérifiez, puis cliquez sur « Valider le brouillon »' },
      { role: 'assistant', text: 'Le brouillon a été validé' },
      { role: 'user', text: 'Merci' }
    ]
    const merged = withSilentPasses(conversation, [{ at: 2, actions: ['clicked "Valider le brouillon"'] }])
    expect(merged.map(m => m.role)).toEqual(['user', 'assistant', 'user', 'assistant', 'user'])
    expect(merged[2].text).toContain('clicked "Valider le brouillon"')
    expect(merged[2].text).toMatch(/without writing a message/)
    // the conversation read from the chat is left as it is
    expect(conversation).toHaveLength(4)
    // a pass with no action leaves nothing
    expect(withSilentPasses(conversation, [{ at: 2, actions: [] }])).toEqual(conversation)
  })
})
