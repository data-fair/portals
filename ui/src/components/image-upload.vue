<template>
  <v-file-input
    :label="label"
    :model-value="pseudoFile"
    accept="image/*"
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
import type { Image } from '#api/types/image'

type ImageRef = {
  _id: string,
  name: string,
  mimeType: string,
  mobileAlt?: boolean
}

const imageRef = defineModel<ImageRef>()

const pseudoFile = computed(() => {
  return imageRef.value && ({ name: imageRef.value.name } as unknown as File)
})

const previewSrc = computed(() => {
  if (!imageRef.value) return
  let id = imageRef.value._id
  if (imageRef.value.mobileAlt) id += '-mobile'
  return $apiPath + '/images/' + id + '/data'
})

const { width, height, resource } = defineProps({
  label: { type: String, default: undefined },
  width: { type: Number, default: undefined },
  height: { type: Number, default: undefined },
  resource: { type: Object as () => ({ type: 'page' | 'portal', _id: string }), required: true }
})

const loadFile = useAsyncAction(async (file: File) => {
  if (!file) {
    imageRef.value = undefined
    return
  }
  const form = new FormData()
  form.append('body', JSON.stringify({ resource }))
  form.append('image', file)
  const image = await $fetch<Image>('/images', { method: 'POST', body: form, params: { width, height } })
  imageRef.value = { _id: image._id, name: image.name, mimeType: image.mimeType, mobileAlt: image.mobileAlt }
})
</script>
