import { test, expect } from '@playwright/test'
import { errorsInSseBody, errorsInResponse } from '../../../simulations/runner/gateway-errors.ts'
import { bridgeSettings, MODEL_ROLES } from '../../../simulations/runner/settings.ts'

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
})
