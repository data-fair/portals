<template>
  <div
    :class="[
      'd-flex justify-center align-center',
      element.banner && ((preview || !context.isRoot) ? 'banner-contained' : 'banner-fluid'),
      element.banner && element.sticky && context.isRoot && context.index === 0 && 'mt-n4',
      element.banner && element.sticky && context.isRoot && context.index === context.parentLength - 1 && 'mb-n4',
      element.mb !== 0 && `mb-${element.mb ?? 4}`
    ]"
    :style="{
      ...(src && {
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }),
      ...(element.height && {
        minHeight: `${element.height}px`
      })
    }"
  >
    <v-text-field
      v-model="searchQuery"
      :label="t('searchLabel')"
      :density="element.density"
      :rounded="element.rounded"
      color="primary"
      base-color="primary"
      bg-color="surface"
      max-width="400"
      variant="outlined"
      autofocus
      hide-details
      @keyup.enter="onSearch"
    >
      <template #append>
        <v-btn
          color="primary"
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
import type { ImageRef } from '#api/types/image-ref/index.ts'
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
const { preview } = usePortalStore()

const searchQuery = ref('')

const onSearch = () => {
  if (searchQuery.value?.trim()) {
    router.push({
      path: '/datasets',
      query: { q: searchQuery.value.trim() }
    })
  }
}

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!
const src = computed(() => {
  if (!element.backgroundImage) return
  return getImageSrc(element.backgroundImage, false)
})

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
.banner-fluid {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}

.banner-contained {
  width: 100%;
}
</style>
