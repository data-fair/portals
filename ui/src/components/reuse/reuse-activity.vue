<template>
  <v-list-item
    :prepend-avatar="avatarUrl"
    :title="ownerName"
  />
  <v-list-item
    :prepend-icon="mdiPencil"
    :title="reuseFetch.data.value?.updated.name"
    :subtitle="dayjs(reuseFetch.data.value?.updated.date).format(t('dateFormat'))"
  />
  <v-list-item
    :prepend-icon="mdiPlusCircleOutline"
    :title="reuseFetch.data.value?.created.name"
    :subtitle="dayjs(reuseFetch.data.value?.created.date).format(t('dateFormat'))"
  />
</template>

<script setup lang="ts">
import { mdiPencil, mdiPlusCircleOutline } from '@mdi/js'

const { dayjs } = useLocaleDayjs()
const { t } = useI18n()
const { reuseFetch } = useReuseStore()

const ownerName = computed(() => {
  if (!reuseFetch.data.value) return ''
  const baseName = reuseFetch.data.value.owner.name || reuseFetch.data.value.owner.id
  const departmentInfo = reuseFetch.data.value.owner.departmentName || reuseFetch.data.value.owner.department
  return departmentInfo
    ? `${baseName} - ${departmentInfo}`
    : baseName
})

const avatarUrl = computed(() => {
  if (reuseFetch.data.value?.owner.department) return `/simple-directory/api/avatars/${reuseFetch.data.value?.owner.type}/${reuseFetch.data.value?.owner.id}/${reuseFetch.data.value?.owner.department}/avatar.png`
  else return `/simple-directory/api/avatars/${reuseFetch.data.value?.owner.type}/${reuseFetch.data.value?.owner.id}/avatar.png`
})

</script>

<i18n lang="yaml">
  en:
    dateFormat: D MMM YYYY at HH:mm

  fr:
    dateFormat: D MMM YYYY à HH:mm

</i18n>
