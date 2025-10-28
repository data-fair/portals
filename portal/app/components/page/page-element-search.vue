<template>
  <div
    :class="[
      element.mb !== 0 && `mb-${element.mb ?? 4}`,
      element.centered ? 'd-flex justify-center' : undefined
    ]"
  >
    <v-text-field
      v-model="searchQuery"
      :label="t('searchLabel')"
      :density="element.density"
      :rounded="element.rounded"
      :color="element.color || 'primary'"
      :base-color="element.color || 'primary'"
      bg-color="surface"
      max-width="400"
      variant="solo"
      autofocus
      flat
      hide-details
      @keyup.enter="onSearch"
    >
      <template #append>
        <v-btn
          :color="element.color || 'primary'"
          stacked
          :title="t('searchBtn')"
          :density="element.density"
          :rounded="element.rounded"
          :elevation="element.elevation"
          @click="onSearch"
        >
          <v-icon :icon="mdiMagnify" />
        </v-btn>
      </template>
    </v-text-field>
  </div>
</template>

<script setup lang="ts">
import type { SearchElement } from '#api/types/page-elements'
import { mdiMagnify } from '@mdi/js'

const { element } = defineProps<{
  element: SearchElement
  context: {
    isRoot: boolean
    index: number
    parentLength: number
  }
}>()

const { t } = useI18n()
const router = useRouter()

const searchQuery = ref('')

const onSearch = () => {
  if (searchQuery.value?.trim()) {
    router.push({
      path: '/datasets',
      query: { q: searchQuery.value.trim() }
    })
  }
}

// TODO Remove
// applyTint: {
//   type: 'boolean',
//   title: "Appliquer une teinte colorée sur l'image",
//   description: "Applique une teinte de la couleur sélectionnée sur l'image de fond pour améliorer la lisibilité du contenu. Cette option n'a aucun effet si l'image ou la couleur n'est pas définie.",
// }
</script>

<i18n lang="yaml">
  en:
    searchLabel: Search datasets
    searchBtn: Search

  fr:
    searchLabel: Saisissez votre recherche
    searchBtn: Rechercher
</i18n>

<style scoped>
:deep(.v-input--horizontal .v-input__append) {
  margin-inline-start: 0 !important;
}
</style>
