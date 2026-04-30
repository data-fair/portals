<template>
  <v-btn
    v-if="link.visible.value"
    :href="link.href.value"
    target="_blank"
    rel="noopener"
    color="primary"
    variant="elevated"
    size="small"
    :prepend-icon="mdiPencil"
  >
    {{ t('edit') }}
  </v-btn>
</template>

<script setup lang="ts">
import { mdiPencil } from '@mdi/js'

const props = defineProps<{
  kind: 'dataset' | 'application' | 'reuse' | 'page'
  resource: { id?: string; _id?: string } | null | undefined
}>()

const { t } = useI18n()
const link = useEditResourceLink(props.kind, toRef(props, 'resource'))
</script>

<i18n lang="yaml">
en:
  edit: Edit
fr:
  edit: Éditer
</i18n>
