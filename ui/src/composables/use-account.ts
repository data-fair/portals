import { computedAsync } from '@vueuse/core'
import { ofetch } from 'ofetch'
import { $sitePath } from '../context.js'

/** `True` if the active account isn't in a department and his organization has departments */
export function useHasDepartments () {
  const session = useSessionAuthenticated()

  return computedAsync(async (): Promise<boolean> => {
    if (session.state.account.department || session.state.account.type === 'user') return false
    const org = await ofetch<{ departments?: any[] }>(`/simple-directory/api/organizations/${session.state.account.id}`, { baseURL: $sitePath })
    return !!org.departments?.length
  }, false)
}
