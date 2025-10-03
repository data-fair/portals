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
        :locale="locale"
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
import type { Options as VjsfOptions } from '@koumoul/vjsf'
import type { Portal, PortalIngress } from '#api/types/portal'
import equal from 'fast-deep-equal'

const { t, locale } = useI18n()
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
  titleDepth: 4,
  updateOn: 'blur'
}))

</script>

<i18n lang="yaml">
  en:
    manageDomainExposure: Manage domain exposure
    portals: Portals
    save: Save

  fr:
    manageDomainExposure: Gérer l'exposition sur un domaine
    portals: Portails
    save: Enregistrer

</i18n>
