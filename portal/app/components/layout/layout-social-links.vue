<template>
  <v-btn
    v-if="links.bluesky"
    :href="`https://bsky.app/profile/${links.bluesky}`"
    target="_blank"
    rel="noopener noreferrer"
    title="Ouvrir le profil Bluesky"
    density="comfortable"
    icon
  >
    <icon-bluesky />
  </v-btn>
  <v-btn
    v-if="links.x"
    :href="`https://x.com/${links.x}`"
    target="_blank"
    rel="noopener noreferrer"
    title="Ouvrir le profil X"
    density="comfortable"
    icon
  >
    <icon-x />
  </v-btn>
  <v-btn
    v-if="links.facebook"
    :icon="mdiFacebook"
    :href="`https://facebook.com/${links.facebook}`"
    target="_blank"
    rel="noopener noreferrer"
    title="Ouvrir le profil Facebook"
    density="comfortable"
  />
  <v-btn
    v-if="links.linkedin"
    :icon="mdiLinkedin"
    :href="`https://linkedin.com/company/${links.linkedin}`"
    target="_blank"
    rel="noopener noreferrer"
    title="Ouvrir le profil LinkedIn"
    density="comfortable"
  />
  <v-btn
    v-if="links.instagram"
    :icon="mdiInstagram"
    :href="`https://instagram.com/${links.instagram}`"
    target="_blank"
    rel="noopener noreferrer"
    title="Ouvrir le profil Instagram"
    density="comfortable"
  />
  <v-btn
    v-if="links.youtube"
    :icon="mdiYoutube"
    :href="`https://youtube.com/${links.youtube}`"
    target="_blank"
    rel="noopener noreferrer"
    title="Ouvrir le profil YouTube"
    density="comfortable"
  />
  <v-btn
    v-if="links.vimeo"
    :icon="mdiVimeo"
    :href="`https://vimeo.com/${links.vimeo}`"
    target="_blank"
    rel="noopener noreferrer"
    title="Ouvrir le profil Vimeo"
    density="comfortable"
  />
</template>

<script setup lang="ts">
import type { SocialLinks } from '#api/types/portal'
import { mdiFacebook, mdiInstagram, mdiLinkedin, mdiVimeo, mdiYoutube } from '@mdi/js'

defineProps<{
  links: SocialLinks
}>()
</script>
