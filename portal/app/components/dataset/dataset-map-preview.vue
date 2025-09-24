<template>
  <v-dialog max-width="1200">
    <template #activator="{ props }">
      <action-btn
        v-bind="props"
        :icon="mdiMapMarker"
        :text="t('preview')"
        :short-text="t('previewShort')"
      />
    </template>
    <template #default="{ isActive }">
      <v-card>
        <v-toolbar
          :title="t('previewShort') + ' - ' + dataset.title"
          density="compact"
          color="surface"
        >
          <v-spacer />
          <v-btn
            :icon="mdiClose"
            @click="isActive.value = false"
          />
        </v-toolbar>
        <d-frame
          :title="t('previewShort') + ' - ' + dataset.title"
          :src="`/data-fair/next-ui/embed/dataset/${dataset.id}/map`"
        />
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { mdiClose, mdiMapMarker } from '@mdi/js'

type Dataset = {
  id: string
  title: string
}

const { dataset } = defineProps<{ dataset: Dataset }>()
const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    preview: Generic map
    previewShort: Map
  fr:
    preview: Carte générique
    previewShort: Carte
</i18n>
