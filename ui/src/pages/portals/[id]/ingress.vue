<template>
  <v-container data-iframe-height>
    <v-row>
      <v-col>
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
              Enregistrer
            </v-btn>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<!--
<i18n lang="yaml">
fr:
en:
</i18n>
-->

<script lang="ts" setup>
import { type Options as VjsfOptions } from '@koumoul/vjsf'
import { type PortalIngress, type Portal } from '#api/types/portal/index'
import equal from 'fast-deep-equal'

const route = useRoute<'/portals/[id]/ingress'>()

const portalFetch = useFetch<Portal>($apiPath + '/portals/' + route.params.id)
const editIngress = ref<PortalIngress>()
watch(portalFetch.data, () => {
  if (portalFetch.data.value) editIngress.value = portalFetch.data.value.ingress ?? { url: '' }
})

const hasDiff = computed(() => {
  return !equal(editIngress.value, portalFetch.data.value?.ingress)
})

const formValid = ref(false)

const vjsfOptions = computed<VjsfOptions | null>(() => {
  return {
    titleDepth: 4,
    density: 'comfortable',
    locale: 'fr',
    updateOn: 'blur',
    initialValidation: 'always',
    context: {
      ingressControllers: $uiConfig.ingressControllers
    }
  }
})

const saveIngress = useAsyncAction(async () => {
  await $fetch(`/portals/${route.params.id}/ingress`, { method: 'POST', body: editIngress.value })
  await portalFetch.refresh()
})

watch(portalFetch.data, (portal) => {
  if (!portal) return
  setBreadcrumbs([{
    text: 'Pages',
    to: '/portals'
  }, {
    text: portal.config.title,
    to: '/portals/' + portal._id
  }, {
    text: 'Gérer l\'exposition sur un domaine'
  }])
})

</script>

<style lang="css">
</style>
