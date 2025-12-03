<template>
  <v-card
    :to="`/uses/${use._id}`"
    class="h-100 d-flex flex-column"
    :elevation="1"
    rounded="default"
  >
    <v-card-title
      class="font-weight-bold"
      style="white-space: unset;"
    >
      {{ use.config.title }}
    </v-card-title>
    <v-card-text
      v-if="use.config.summary"
      class="pb-0"
    >
      {{ use.config.summary }}
    </v-card-text>

    <v-spacer />

    <v-list-item>
      <template #prepend>
        <owner-avatar
          v-if="showOwner"
          :owner="use.owner"
        />
      </template>
      <span :class="['text-caption', showOwner ? 'ml-2' : '']">
        <template v-if="use.config.author">
          {{ t('publishedBy', { author: use.config.author }) }}
        </template>
      </span>
    </v-list-item>
  </v-card>
</template>

<script setup lang="ts">
import type { Use } from '#api/types/use/index'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const { use, showOwner = false } = defineProps<{
  use: Use
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
