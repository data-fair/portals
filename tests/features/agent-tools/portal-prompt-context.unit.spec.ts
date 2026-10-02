import { test, expect } from '@playwright/test'
import { portalPromptContext } from '../../../portal/app/composables/agent/portal-prompt-context.ts'

// Judged simulations of the public portal: asked to show something on screen, the
// assistant answered with a link the person had to open; asked about « ce que je vois
// à l'écran », it answered from memory and contradicted the screen.
test.describe('portal prompt context', () => {
  test('asks to act on the screen and to read it before describing it', () => {
    const prompt = portalPromptContext({ title: 'Portail test' } as any, 'Owner').join('\n')
    expect(prompt).toContain('navigate')
    expect(prompt).toContain('get_current_location')
    expect(prompt).toContain('pageFilters_get')
  })
})
