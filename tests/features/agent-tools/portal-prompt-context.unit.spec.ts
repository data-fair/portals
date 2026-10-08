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

  test('says how to check what a dataset table on screen shows', () => {
    // a judged run opened a filtered table, then said « je ne vois pas les lignes du tableau »
    // and left the check to the person: the table shows the rows of the page's filters, which
    // the data sub-agent can query
    const prompt = portalPromptContext({ title: 'Portail test' } as any, 'Owner').join('\n')
    expect(prompt).toContain('le tableau affiche exactement ces lignes')
    expect(prompt).toContain('subagent_dataset_data')
  })
})
