<template>
  <v-dialog
    v-model="show"
    max-width="600"
    :persistent="save.loading.value"
  >
    <v-card
      :title="t('contributionManagementTitle')"
      :subtitle="t('contributionManagementSubtitle')"
      :loading="save.loading.value ? 'primary' : undefined"
    >
      <v-card-text>
        <v-checkbox
          v-model="staging"
          :label="t('stagingLabel')"
          :hint="t('stagingHint')"
          persistent-hint
          color="primary"
          density="comfortable"
        />
        <v-select
          v-if="departments.length"
          v-model="contributorDepartments"
          :items="departments"
          item-title="name"
          item-value="id"
          class="mt-4"
          :label="t('contributorDepartmentsLabel')"
          :hint="t('contributorDepartmentsHint')"
          persistent-hint
          multiple
          chips
          closable-chips
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="save.loading.value"
          @click="show = false"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="save.loading.value"
          @click="save.execute()"
        >
          {{ t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { Portal } from '#api/types/portal/index.ts'

const { t } = useI18n()

const show = defineModel<boolean>({ default: false })
const props = defineProps<{ portal: Portal }>()

const departmentsFetch = useFetch<{ departments?: { id: string, name: string }[] }>(
  () => props.portal.owner.type === 'organization' && !props.portal.owner.department
    ? `${$sitePath}/simple-directory/api/organizations/${props.portal.owner.id}`
    : null,
  { notifError: false }
)
const departments = computed(() => departmentsFetch.data.value?.departments ?? [])
const emit = defineEmits<{ (e: 'refresh-portal'): void }>()

const staging = ref(!!props.portal.staging)
const contributorDepartments = ref<string[]>(props.portal.contributorDepartments ?? [])

watch(show, (visible) => {
  if (visible) {
    staging.value = !!props.portal.staging
    contributorDepartments.value = props.portal.contributorDepartments ?? []
  }
})

const save = useAsyncAction(
  async () => {
    await $fetch(`/portals/${props.portal._id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        staging: staging.value,
        contributorDepartments: contributorDepartments.value
      })
    })
    emit('refresh-portal')
    show.value = false
  },
  {
    success: t('contributionsUpdated'),
    error: t('errorUpdatingContributions'),
  }
)
</script>

<i18n lang="yaml">
  en:
    contributionManagementTitle: Contribution management
    contributionManagementSubtitle: Who can publish datasets and applications on this portal
    stagingLabel: Staging portal
    stagingHint: If enabled, any organisation contributor may publish directly on this portal without admin approval.
    contributorDepartmentsLabel: Contributor departments
    contributorDepartmentsHint: Admins of the selected departments may publish on this portal as if it were owned by their department.
    cancel: Cancel
    save: Save
    contributionsUpdated: Contribution settings updated
    errorUpdatingContributions: Error while updating contribution settings
  fr:
    contributionManagementTitle: Gestion des contributions
    contributionManagementSubtitle: Qui peut publier des jeux de données et des applications sur ce portail
    stagingLabel: Portail de pré-production
    stagingHint: Si activé, tout contributeur de l'organisation peut publier directement sur ce portail sans validation par un administrateur.
    contributorDepartmentsLabel: Départements contributeurs
    contributorDepartmentsHint: Les administrateurs des départements sélectionnés pourront publier sur ce portail comme s'ils en étaient propriétaires.
    cancel: Annuler
    save: Enregistrer
    contributionsUpdated: Paramètres de contribution mis à jour
    errorUpdatingContributions: Erreur lors de la mise à jour des paramètres de contribution
</i18n>
