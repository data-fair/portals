<template>
  <action-btn
    v-if="!preview && link.visible.value"
    :href="link.href.value"
    target="_blank"
    rel="noopener"
    color="primary"
    :action-style="actionStyle ?? 'full'"
    :icon="mdiPencil"
    :text="t('edit')"
    :tooltip="`${t('editKind.' + kind)} - ${t('newWindow')}`"
  />
</template>

<script setup lang="ts">
import type { DatasetCard } from '#api/types/portal/index.js'
import { mdiPencil } from '@mdi/js'

const props = defineProps<{
  kind: 'dataset' | 'application' | 'reuse' | 'page'
  resource: { id?: string; _id?: string } | null | undefined
  actionStyle?: DatasetCard['actionsStyle']
}>()

const { t } = useI18n()
const { preview } = usePortalStore()
const link = useEditResourceLink(props.kind, toRef(props, 'resource'))
</script>

<i18n lang="yaml">
en:
  edit: Edit
  newWindow: New window
  editKind:
    dataset: Edit the dataset
    application: Edit the application
    reuse: Edit the reuse
    page: Edit the page
fr:
  edit: Éditer
  newWindow: Nouvelle fenêtre
  editKind:
    dataset: Éditer le jeu de données
    application: Éditer la visualisation
    reuse: Éditer la réutilisation
    page: Éditer la page
</i18n>
