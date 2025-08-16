<template>
  <v-file-input
    @update:model-value="file => loadFile.execute(file as File)"
  >
    <template #prepend>
      <v-img
        v-if="previewSrc"
        :src="previewSrc"
      />
    </template>
  </v-file-input>
</template>

<script setup lang="ts">
import { type Image } from '#api/types/image'

type ImageRef = {
  _id: string,
  mimeType: string,
  mobileAlt?: boolean
}

const imageRef = defineModel<ImageRef>()

const previewSrc = computed(() => {
  if (!imageRef.value) return
  let id = imageRef.value._id
  if (imageRef.value.mobileAlt) id += '-mobile'
  return $apiPath + '/images/' + id + '/data'
})

const { width, height, resource } = defineProps({
  width: { type: Number, required: false, default: undefined },
  height: { type: Number, required: false, default: undefined },
  resource: { type: Object as () => ({ type: 'page' | 'portal', _id: string }), required: true }
})

const loadFile = useAsyncAction(async (file: File) => {
  const form = new FormData()
  form.append('body', JSON.stringify({ width, height, resource }))
  form.append('image', file)
  const image = await $fetch<Image>('/images', { method: 'POST', body: form })
  imageRef.value = { _id: image._id, mimeType: image.mimeType, mobileAlt: image.mobileAlt }
})
</script>
