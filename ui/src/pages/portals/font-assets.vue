<template>
  <v-container
    data-iframe-height
    style="min-height:500px"
  >
    <v-row class="ma-0">
      <v-col v-if="!addToggle">
        <p
          type="info"
          variant="outlined"
          class="mb-4"
        >
          {{ t('msg') }}
        </p>
        <v-btn
          color="primary"
          class="mb-3"
          @click="addToggle = true"
        >
          {{ t('addFontAsset') }}
        </v-btn>
      </v-col>
      <v-slide-y-transition v-if="addToggle">
        <v-card
          :title="t('addFontAsset')"
        >
          <v-card-text>
            <v-form v-model="formValid">
              <vjsf-font-asset
                v-model="newFontAsset"
                :options="vjsfOptions"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              @click="addToggle = false"
            >
              {{ t('cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              :disabled="!formValid || addFontAsset.loading.value"
              @click="addFontAsset.execute()"
            >
              {{ t('add') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-slide-y-transition>
    </v-row>
    <v-row class="ma-0">
      <v-list>
        <v-list-item
          v-for="fontAsset in fontAssetsFetch.data.value?.results"
          :key="fontAsset._id"
          :title="`${fontAsset.name} - ${fontAsset.subset} - ${fontAsset.weightRange} - ${fontAsset.style}`"
        >
          <template #append>
            <v-list-item-action>
              <v-btn
                :title="t('delete')"
                color="warning"
                :icon="mdiDelete"
                variant="text"
                :disabled="deleteFontAsset.loading.value"
                @click="deleteFontAsset.execute(fontAsset._id)"
              />
            </v-list-item-action>
          </template>
        </v-list-item>
      </v-list>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { FontAsset } from '#api/types/font-asset'

const { t } = useI18n()

setBreadcrumbs([
  { text: t('portals'), to: '/portals' },
  { text: t('fontAssets') }
])

const fontAssetsFetch = useFetch<{ results: FontAsset[], count: number }>($apiPath + '/font-assets')

const addFontAsset = useAsyncAction(async () => {
  const form = new FormData()
  form.append('body', JSON.stringify(newFontAsset.value))
  form.append('font-asset', newFontAsset.value.file)
  await $fetch('/font-assets', { method: 'POST', body: form })
  await fontAssetsFetch.refresh()
  addToggle.value = false
})

const deleteFontAsset = useAsyncAction(async (assetId: string) => {
  await $fetch('/font-assets/' + assetId, { method: 'DELETE' })
  await fontAssetsFetch.refresh()
})

const addToggle = ref(false)
watch(addToggle, () => {
  newFontAsset.value = {}
})

const formValid = ref(false)
const newFontAsset = ref<any>({})

const vjsfOptions = { density: 'comfortable' }

</script>

<i18n lang="yaml">
  en:
    msg: You can load multiple files for variants of the same font family.
    portals: Portals
    fontAssets: Font families
    addFontAsset: Add a file
    cancel: Cancel
    add: Add
    delete: Delete

  fr:
    msg: Vous pouvez charger plusieurs fichiers pour des variantes de la même police de caractères.
    portals: Portails
    fontAssets: Polices de caractères
    addFontAsset: Ajouter un fichier de police de caractères
    cancel: Annuler
    add: Ajouter
    delete: Supprimer

</i18n>
