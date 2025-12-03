<template>
  <v-card
    :to="`/reuses/${reuse._id}`"
    class="h-100 d-flex flex-column"
    :elevation="1"
    rounded="default"
  >
    <v-card-title
      class="font-weight-bold"
      style="white-space: unset;"
    >
      {{ reuse.config.title }}
    </v-card-title>
    <v-card-text
      v-if="reuse.config.summary"
      class="pb-0"
    >
      {{ reuse.config.summary }}
    </v-card-text>

    <v-spacer />

    <v-list-item>
      <template #prepend>
        <owner-avatar
          v-if="showOwner"
          :owner="reuse.owner"
        />
      </template>
      <span :class="['text-caption', showOwner ? 'ml-2' : '']">
        <template v-if="reuse.config.author">
          {{ t('publishedBy', { author: reuse.config.author }) }}
        </template>
      </span>
    </v-list-item>
  </v-card>
</template>

<script setup lang="ts">
import type { Reuse } from '#api/types/reuse/index'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const { reuse, showOwner = false } = defineProps<{
  reuse: Reuse
  showOwner?: boolean
}>()

const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    publishedBy: Published by {author}

  fr:
    publishedBy: Publié par {author}

</i18n>
