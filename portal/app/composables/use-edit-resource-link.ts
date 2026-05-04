import type { ComputedRef, Ref } from 'vue'

type DataFairKind = 'dataset' | 'application'
type PortalKind = 'reuse' | 'page'
type ResourceKind = DataFairKind | PortalKind

interface ResourceShape {
  id?: string
  _id?: string
}

interface UseEditResourceLinkResult {
  visible: ComputedRef<boolean>
  href: ComputedRef<string>
}

const isDataFairKind = (k: ResourceKind): k is DataFairKind => k === 'dataset' || k === 'application'

export const useEditResourceLink = (
  kind: ResourceKind,
  resource: Ref<ResourceShape | null | undefined>
): UseEditResourceLinkResult => {
  const session = useSession()
  const baseBackOfficeUrl = useBackOfficeUrl()

  const resourceId = computed(() => resource.value?.id ?? resource.value?._id ?? '')

  const href = computed(() => {
    if (!resourceId.value) return ''
    const path = isDataFairKind(kind) ? kind : `${kind}s`
    return `${baseBackOfficeUrl.value}/${path}/${resourceId.value}`
  })

  if (isDataFairKind(kind)) {
    // Client-only fetch of userPermissions, only when a session exists.
    const userPermissions = ref<string[]>([])
    if (import.meta.client) {
      watchEffect(async () => {
        userPermissions.value = []
        if (!session.user.value || !resourceId.value) return
        try {
          const data = await $fetch<{ userPermissions?: string[] }>(
            `/data-fair/api/v1/${kind}s/${resourceId.value}`,
            { query: { select: 'id,userPermissions' } }
          )
          userPermissions.value = data.userPermissions ?? []
        } catch {
          userPermissions.value = []
        }
      })
    }
    const visible = computed(() => userPermissions.value.includes('writeDescription'))
    return { visible, href }
  }

  // Portal-only kinds (reuse, page): owner is always the portal owner.
  const { portal } = usePortalStore()
  const visible = computed(() => {
    if (!session.user.value) return false
    const account = session.account.value
    const owner = portal.value.owner
    if (!account || !owner) return false
    if (account.type !== owner.type || account.id !== owner.id) return false
    return session.accountRole.value === 'admin'
  })

  return { visible, href }
}
