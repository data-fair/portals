<template>
  <v-file-input
    :error-messages="error"
    :label="t('label')"
    :loading="uploading"
    :model-value="pseudoFile"
    accept="video/mp4,video/webm"
    hide-details="auto"
    @update:model-value="file => onFile(file as File)"
  />
  <v-progress-linear
    v-if="uploading"
    :model-value="progress"
    class="mt-2"
  />
  <v-alert
    v-for="warning in warnings"
    :key="warning"
    :text="warning"
    class="mt-2"
    density="compact"
    type="warning"
    variant="tonal"
  />
</template>

<script setup lang="ts">
import { hasFaststart, probeVideo } from '../utils/video-file.ts'

type VideoRef = { _id: string, name: string, mimeType: string, width?: number, height?: number, duration?: number, posterId?: string }

const videoRef = defineModel<VideoRef>()
const { t } = useI18n()

const uploading = ref(false)
const progress = ref(0)
const error = ref<string>()
const warnings = ref<string[]>([])
const pseudoFile = computed(() => videoRef.value && ({ name: videoRef.value.name } as unknown as File))

const upload = (body: Blob, type: string, params: Record<string, string>, onProgress?: (ratio: number) => void) => new Promise<VideoRef>((resolve, reject) => {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', `${$apiPath}/assets?${new URLSearchParams(params)}`)
  xhr.setRequestHeader('content-type', type)
  xhr.upload.onprogress = e => onProgress?.(e.loaded / e.total)
  xhr.onload = () => xhr.status < 300 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error(xhr.responseText))
  xhr.onerror = () => reject(new Error('network error'))
  xhr.send(body)
})

const onFile = async (file: File | null) => {
  error.value = undefined
  warnings.value = []
  if (!file) {
    videoRef.value = undefined
    return
  }
  let probe
  try {
    probe = await probeVideo(file)
  } catch {
    error.value = t('unreadable')
    return
  }
  const mbPerMinute = file.size / 1e6 / (probe.duration / 60)
  if (mbPerMinute > 15) warnings.value.push(t('heavy', { value: Math.round(mbPerMinute) }))
  if (file.type === 'video/mp4' && !await hasFaststart(file)) warnings.value.push(t('noFaststart'))

  uploading.value = true
  progress.value = 0
  try {
    const poster = probe.poster && await upload(probe.poster, 'image/webp', { name: `${file.name}.webp` })
    const asset = await upload(file, file.type, {
      name: file.name,
      width: String(probe.width),
      height: String(probe.height),
      duration: String(probe.duration)
    }, ratio => { progress.value = ratio * 100 })
    videoRef.value = {
      _id: asset._id,
      name: asset.name,
      mimeType: asset.mimeType,
      width: probe.width,
      height: probe.height,
      duration: probe.duration,
      posterId: poster?._id
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    uploading.value = false
  }
}
</script>

<i18n lang="yaml">
  en:
    label: Video file (MP4 H.264 or WebM)
    unreadable: This browser cannot read this file. Convert it to MP4 H.264, for example with HandBrake.
    heavy: 'This video weighs { value } MB per minute: visitors with a slow connection will have to wait. Aim for less than 10 MB per minute.'
    noFaststart: This MP4 is not optimized for the web, it will start slowly. In HandBrake, tick "Web Optimized".
  fr:
    label: Fichier vidéo (MP4 H.264 ou WebM)
    unreadable: Ce navigateur ne sait pas lire ce fichier. Convertissez-le en MP4 H.264, par exemple avec HandBrake.
    heavy: "Cette vidéo pèse { value } Mo par minute : les visiteurs avec une connexion lente devront attendre. Visez moins de 10 Mo par minute."
    noFaststart: Ce MP4 n'est pas optimisé pour le web, il démarrera lentement. Dans HandBrake, cochez « Web Optimized ».
</i18n>
