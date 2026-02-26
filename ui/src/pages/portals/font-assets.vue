<template>
  <v-container data-iframe-height>
    <v-row>
      <!-- Main column: add form + list -->
      <v-col
        cols="12"
        md="8"
      >
        <!-- Add section -->
        <div
          v-if="!addToggle"
          class="mb-4"
        >
          <p class="mb-3 text-body-2 text-medium-emphasis">
            {{ t('msg') }}
          </p>
          <v-btn
            block
            color="primary"
            :prepend-icon="mdiPlus"
            @click="addToggle = true"
          >
            {{ t('addFontAsset') }}
          </v-btn>
        </div>

        <v-slide-y-transition>
          <v-card
            v-if="addToggle"
            :title="t('addFontAsset')"
            variant="outlined"
            class="mb-4"
          >
            <v-card-text>
              <v-form
                v-model="formValid"
                @submit.prevent
              >
                <vjsf-font-asset
                  v-model="newFontAsset"
                  :options="vjsfOptions"
                />
              </v-form>
            </v-card-text>

            <v-card-actions
              style="min-height: auto"
              class="pt-0"
            >
              <v-spacer />

              <v-btn
                size="small"
                :disabled="addFontAsset.loading.value"
                @click="addToggle = false"
              >
                {{ t('cancel') }}
              </v-btn>
              <v-btn
                size="small"
                color="primary"
                variant="elevated"
                :disabled="!formValid"
                :loading="addFontAsset.loading.value"
                @click="addFontAsset.execute()"
              >
                {{ t('add') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-slide-y-transition>

        <!-- Font families grouped by name -->
        <v-card
          v-for="(variants, familyName) in fontsByFamily"
          :key="familyName"
          class="mb-2"
          :title="familyName"
        >
          <v-divider />
          <v-list>
            <v-list-item
              v-for="fontAsset in variants"
              :key="fontAsset._id"
              :title="fontAsset.file.name"
              :subtitle="editingId !== fontAsset._id ? `${subsetLabel(fontAsset.subset)} — ${fontAsset.weightRange} — ${fontAsset.style}` : undefined"
            >
              <template #append>
                <template v-if="editingId !== fontAsset._id">
                  <v-btn
                    :title="t('edit')"
                    :icon="mdiPencil"
                    variant="text"
                    color="primary"
                    density="compact"
                    class="mr-2"
                    @click="startEdit(fontAsset)"
                  />
                  <!-- Delete confirmation -->
                  <v-menu
                    :close-on-content-click="false"
                    max-width="400"
                  >
                    <template #activator="{ props: menuProps }">
                      <v-btn
                        v-bind="menuProps"
                        :title="t('delete')"
                        :icon="mdiDelete"
                        variant="text"
                        color="warning"
                        density="compact"
                        :loading="deleteFontAsset.loading.value && deletingId === fontAsset._id"
                      />
                    </template>
                    <template #default="{ isActive }">
                      <v-card
                        variant="elevated"
                        :title="t('confirmDeleteTitle')"
                        :text="t('confirmDeleteText', { name: fontAsset.file.name })"
                        :loading="deleteFontAsset.loading.value ? 'warning' : undefined"
                      >
                        <v-card-actions>
                          <v-spacer />
                          <v-btn
                            :disabled="deleteFontAsset.loading.value"
                            @click="isActive.value = false"
                          >
                            {{ t('cancel') }}
                          </v-btn>
                          <v-btn
                            color="warning"
                            variant="flat"
                            :loading="deleteFontAsset.loading.value"
                            @click="deleteFontAsset.execute(fontAsset._id)"
                          >
                            {{ t('delete') }}
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </template>
                  </v-menu>
                </template>
              </template>

              <!-- VJSF inline edit -->
              <template v-if="editingId === fontAsset._id">
                <v-form
                  v-model="editFormValid"
                  class="mt-2"
                  @submit.prevent
                >
                  <vjsf-font-asset-patch
                    v-model="editValues"
                    :options="vjsfOptions"
                  />
                </v-form>
                <div class="d-flex justify-end">
                  <v-btn
                    size="small"
                    class="mr-2"
                    variant="text"
                    @click="editingId = null"
                  >
                    {{ t('cancel') }}
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="flat"
                    color="primary"
                    :disabled="!editFormValid"
                    :loading="saveFontAsset.loading.value"
                    @click="saveFontAsset.execute(fontAsset._id)"
                  >
                    {{ t('save') }}
                  </v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Help card -->
      <v-col
        cols="12"
        md="4"
      >
        <v-alert
          :title="t('helpTitle')"
        >
          <p class="mb-3">
            <strong>{{ t('help.variantsTitle') }}</strong><br>
            {{ t('help.variantsBody') }}
          </p>
          <p class="mb-3">
            <strong>{{ t('help.formatsTitle') }}</strong><br>
            {{ t('help.formatsBody') }}
          </p>
          <p class="mb-3">
            <strong>{{ t('help.weightTitle') }}</strong><br>
            {{ t('help.weightBody') }}<br>
            Thin=100<br>
            ExtraLight=200<br>
            Light=300<br>
            Regular/Book/Roman=400<br>
            Medium=500<br>
            SemiBold=600<br>
            Bold=700<br>
            ExtraBold=800<br>
            Heavy/Black=900<br>
          </p>
          <p class="mb-3">
            <strong>{{ t('help.weightRangeTitle') }}</strong><br>
            {{ t('help.weightRangeBody') }}
          </p>
          <p>
            <strong>{{ t('help.subsetTitle') }}</strong><br>
            {{ t('help.subsetBody') }}
          </p>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { FontAsset } from '#api/types/font-asset'
import { mdiDelete, mdiPencil, mdiPlus } from '@mdi/js'

const { t } = useI18n()

setBreadcrumbs([
  { text: t('portals'), to: '/portals' },
  { text: t('fontAssets') }
])

const fontAssetsFetch = useFetch<{ results: FontAsset[], count: number }>($apiPath + '/font-assets')

// Group assets by font family name
const fontsByFamily = computed(() => {
  const families: Record<string, FontAsset[]> = {}
  for (const asset of fontAssetsFetch.data.value?.results ?? []) {
    if (!families[asset.name]) families[asset.name] = []
    families[asset.name].push(asset)
  }
  return families
})

// Add
const addToggle = ref(false)
const formValid = ref(false)
const newFontAsset = ref<any>({})
watch(addToggle, () => { newFontAsset.value = {} })

const addFontAsset = useAsyncAction(async () => {
  const form = new FormData()
  form.append('body', JSON.stringify(newFontAsset.value))
  form.append('font-asset', newFontAsset.value.file)
  await $fetch('/font-assets', { method: 'POST', body: form })
  await fontAssetsFetch.refresh()
  addToggle.value = false
})

// Edit
const editingId = ref<string | null>(null)
const editFormValid = ref(false)
const editValues = ref<any>({})

function startEdit (asset: FontAsset) {
  editingId.value = asset._id
  editValues.value = { name: asset.name, subset: asset.subset, weightRange: asset.weightRange, style: asset.style }
}

const saveFontAsset = useAsyncAction(async (assetId: string) => {
  await $fetch('/font-assets/' + assetId, { method: 'PATCH', body: editValues.value })
  await fontAssetsFetch.refresh()
  editingId.value = null
})

// Delete
const deletingId = ref<string | null>(null)
const deleteFontAsset = useAsyncAction(async (assetId: string) => {
  deletingId.value = assetId
  await $fetch('/font-assets/' + assetId, { method: 'DELETE' })
  await fontAssetsFetch.refresh()
  deletingId.value = null
})

const vjsfOptions = { density: 'comfortable' }

const subsetLabel = (subset: string) => subset === 'latin-ext' ? t('latinExt') : 'Latin'
</script>

<i18n lang="yaml">
  en:
    msg: Upload one file per variant. Give the same family name to all variants.
    portals: Portals
    fontAssets: Font families
    addFontAsset: Add a font file
    cancel: Cancel
    add: Add
    save: Save
    edit: Edit
    delete: Delete
    latinExt: Latin extended
    confirmDeleteTitle: Delete font file
    confirmDeleteText: "Delete {name}?"
    helpTitle: Help
    help:
      variantsTitle: Multiple variants
      variantsBody: To load several variants of the same font (regular, bold, italic, extended charset…), upload one file per variant and use the exact same family name each time.
      formatsTitle: "Supported formats: WOFF2, OTF, TTF"
      formatsBody: WOFF2 is the recommended format for the web (smaller size, broad support). OTF and TTF are also accepted.
      weightTitle: Weight mapping
      weightBody: "Common weight names and their numeric values:"
      weightRangeTitle: Weight range vs single value
      weightRangeBody: "WOFF2 variable fonts can cover a weight range (e.g. 300 700). Static OTF or TTF files must use a single value (e.g. 400)."
      subsetTitle: Latin vs Latin extended
      subsetBody: Latin covers Western European languages (French, English, Spanish…). Latin extended adds Central and Eastern European characters (Polish, Czech, Romanian…). Upload both subsets for maximum coverage.

  fr:
    msg: Chargez un fichier par variante. Donnez le même nom de famille à toutes les variantes.
    portals: Portails
    fontAssets: Polices de caractères
    addFontAsset: Ajouter un fichier de police
    cancel: Annuler
    add: Ajouter
    save: Enregistrer
    edit: Modifier
    delete: Supprimer
    latinExt: Latin étendu
    confirmDeleteTitle: Supprimer le fichier de police
    confirmDeleteText: "Supprimer {name} ?"
    helpTitle: Aide
    help:
      variantsTitle: Plusieurs variantes
      variantsBody: Pour charger plusieurs variantes d'une même police (regular, gras, italique, latin étendu…), chargez un fichier par variante en utilisant exactement le même nom de famille à chaque fois.
      formatsTitle: "Formats supportés : WOFF2, OTF, TTF"
      formatsBody: Le format WOFF2 est recommandé pour le web (taille réduite, large support). Les formats OTF et TTF sont aussi acceptés.
      weightTitle: Correspondance des poids
      weightBody: "Noms courants et leurs valeurs numériques :"
      weightRangeTitle: Plage de poids ou valeur unique
      weightRangeBody: "Les polices WOFF2 variables peuvent couvrir une plage de poids (ex. 300 700). Les fichiers OTF ou TTF statiques doivent utiliser une valeur unique (ex. 400)."
      subsetTitle: Latin vs Latin étendu
      subsetBody: "Latin couvre les langues d'Europe occidentale (français, anglais, espagnol…). Latin étendu ajoute les caractères d'Europe centrale et orientale (polonais, tchèque, roumain…). Chargez les deux pour une couverture maximale."
</i18n>
