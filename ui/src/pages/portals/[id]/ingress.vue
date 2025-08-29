<template>
  <v-container data-iframe-height>
    <v-form
      v-if="editIngress"
      v-model="formValid"
    >
      <vjsf-portal-ingress
        v-if="vjsfOptions"
        v-model="editIngress"
        :options="vjsfOptions"
      />

      <v-row class="mx-0">
        <v-spacer />
        <v-btn
          color="primary"
          :disabled="!hasDiff || !formValid"
          @click="saveIngress.execute()"
        >
          {{ t('save') }}
        </v-btn>
      </v-row>
    </v-form>
  </v-container>
</template>

<script lang="ts" setup>
import { type Options as VjsfOptions } from '@koumoul/vjsf'
import { type PortalIngress, type Portal } from '#api/types/portal/index'
import equal from 'fast-deep-equal'

const { t } = useI18n()
const session = useSessionAuthenticated()
const route = useRoute<'/portals/[id]/ingress'>()

const portalFetch = useFetch<Portal>($apiPath + '/portals/' + route.params.id)
const editIngress = ref<PortalIngress>()
const formValid = ref(false)
watch(portalFetch.data, () => {
  if (portalFetch.data.value) editIngress.value = portalFetch.data.value.ingress ?? { url: '' }
})

const hasDiff = computed(() => {
  return !equal(editIngress.value, portalFetch.data.value?.ingress)
})

const saveIngress = useAsyncAction(async () => {
  await $fetch(`/portals/${route.params.id}/ingress`, { method: 'POST', body: editIngress.value })
  await portalFetch.refresh()
})

watch(portalFetch.data, (portal) => {
  if (!portal) return
  setBreadcrumbs([{
    text: t('portals'),
    to: '/portals'
  }, {
    text: portal.config.title,
    to: '/portals/' + portal._id
  }, {
    text: t('manageDomainExposure'),
  }])
})

const vjsfOptions = computed<VjsfOptions>(() => ({
  context: {
    ingressControllers: $uiConfig.ingressControllers
  },
  density: 'comfortable',
  initialValidation: 'always',
  locale: session.lang.value,
  titleDepth: 4,
  updateOn: 'blur',
  xI18n: true
}))

</script>

<i18n lang="yaml">
  en:
    save: Save
    portals: Portals
    manageDomainExposure: Manage domain exposure

  fr:
    save: Enregistrer
    portals: Portails
    manageDomainExposure: Gérer l'exposition sur un domaine

</i18n>

<!--
<style scoped>
</style>
-->
