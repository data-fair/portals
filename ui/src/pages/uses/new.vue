<template>
  <v-container
    data-iframe-height
    style="min-height:800px"
    class="pa-0"
    fluid
  >
    <v-stepper
      v-model="step"
      style="background-color: transparent"
      flat
    >
      <v-stepper-header>
        <template v-if="hasDepartments">
          <v-stepper-item
            value="owner"
            :title="t('selectOwner')"
            :color="step === 'owner' ? 'primary' : ''"
            editable
            :icon="mdiAccount"
          />
          <v-divider />
        </template>
        <v-stepper-item
          value="information"
          :title="t('useInformation')"
          :color="step === 'information' ? 'primary' : ''"
          :editable="!hasDepartments || ownersReady"
          :icon="mdiTextBox"
        />
      </v-stepper-header>

      <v-stepper-window>
        <!-- Step 1: Select owner (optional) -->
        <v-stepper-window-item value="owner">
          <owner-pick
            v-model="newOwner"
            v-model:ready="ownersReady"
          />
        </v-stepper-window-item>

        <!-- Step 2: Use information -->
        <v-stepper-window-item value="information">
          <v-form v-model="valid">
            <v-text-field
              v-model="newUseTitle"
              :label="t('useTitle')"
              :rules="[v => !!v || t('useTitleRequired')]"
              hide-details="auto"
              autofocus
              required
            />
          </v-form>
        </v-stepper-window-item>
      </v-stepper-window>

      <v-stepper-actions
        v-if="step !== 'owner' || hasDepartments"
        :prev-text="t('previous')"
        @click:prev="goToPreviousStep()"
      >
        <template #next>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="isNextButtonDisabled"
            :loading="createUse.loading.value"
            @click="goToNextStep()"
          >
            {{ step === 'information' ? t('create') : t('next') }}
          </v-btn>
        </template>
      </v-stepper-actions>
    </v-stepper>
  </v-container>
</template>

<script setup lang="ts">
import type { Use } from '#api/types/use/index.ts'
import type { Account } from '@data-fair/lib-common-types/session/index.js'

import { mdiAccount, mdiTextBox } from '@mdi/js'
import { computedAsync } from '@vueuse/core'
import OwnerPick from '@data-fair/lib-vuetify/owner-pick.vue'

const session = useSessionAuthenticated()
const router = useRouter()
const { t } = useI18n()

const step = ref<'owner' | 'information'>('owner')
const newUseTitle = ref<string>('')
const newOwner = ref<Account | undefined>(session.state.account)
const ownersReady = ref(false)
const valid = ref(false)

/** `True` if the active account isn't in a department and his organization has departments */
const hasDepartments = computedAsync(async (): Promise<boolean> => {
  if (session.state.account.department || session.state.account.type === 'user') return false
  const org = await $fetch<{ departments?: any[] }>(`/simple-directory/api/organizations/${session.state.account.id}`, { baseURL: $sitePath })
  return !!org.departments?.length
}, false)

// If no departments, skip to information step
watch(hasDepartments, (value) => {
  if (!value) step.value = 'information'
}, { immediate: true })

const isNextButtonDisabled = computed(() => {
  if (step.value === 'owner') return !ownersReady.value
  if (step.value === 'information') return !valid.value || !newUseTitle.value
  return false
})

const goToPreviousStep = () => {
  if (step.value === 'information' && hasDepartments.value) {
    step.value = 'owner'
  }
}

const goToNextStep = () => {
  if (step.value === 'owner') {
    step.value = 'information'
  } else if (step.value === 'information') {
    createUse.execute()
  }
}

const createUse = useAsyncAction(
  async () => {
    if (!newUseTitle.value) return

    const use = await $fetch<Use>($apiPath + '/uses', {
      method: 'POST',
      body: {
        owner: newOwner.value,
        config: { title: newUseTitle.value }
      }
    })

    await router.replace({ path: `/uses/${use._id}` })
  },
  {
    error: t('errorCreatingUse')
  }
)

setBreadcrumbs([
  { text: t('uses'), to: '/uses' },
  { text: t('createUse') }
])

</script>

<i18n lang="yaml">
  en:
    uses: Uses
    create: Create
    createUse: Create a use
    errorCreatingUse: Error while creating the use
    useInformation: Use information
    next: Next
    useTitle: Use title
    useTitleRequired: Use title is required
    previous: Previous
    selectOwner: Select owner

  fr:
    uses: Réutilisations
    create: Créer
    createUse: Créer une réutilisation
    errorCreatingUse: Erreur lors de la création de la réutilisation
    useInformation: Informations de la réutilisation
    next: Suivant
    useTitle: Titre de la réutilisation
    useTitleRequired: Le titre de la réutilisation est requis
    previous: Précédent
    selectOwner: Sélection du propriétaire

</i18n>
