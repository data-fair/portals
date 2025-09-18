<template>
  <v-row>
    <v-col
      v-if="!tokenFetch?.error.value"
    >
      <v-form v-model="valid">
        <v-text-field
          v-model="message.from"
          :rules="[v => !!v || '']"
          :label="t('email')"
        />
        <v-text-field
          v-model="message.subject"
          :rules="[v => !!v || '']"
          :label="t('subject')"
        />
        <v-textarea
          v-model="message.text"
          :label="t('message')"
        />
        <div class="d-flex justify-center">
          <v-btn
            :disabled="!valid"
            :loading="sendMessage.loading.value"
            @click="sendMessage.execute()"
          >
            {{ t('send') }}
          </v-btn>
        </div>
      </v-form>
    </v-col>
    <v-col
      v-if="element.showInfo || element.showSocial"
      :cols="12"
      :md="4"
    >
      <v-card>
        <v-card-text>
          <div v-if="element.showInfo" v-html="portalConfig.contactInformations.info" />
          <v-divider class="mt-2"/>
        </v-card-text>
        <v-list-item
          v-if="portalConfig.contactInformations.phone"
          :prepend-icon="mdiPhone"
          :title="portalConfig.contactInformations.phoneLabel || portalConfig.contactInformations.phone"
          :href="`tel:${portalConfig.contactInformations.phone}`"
        />
        <v-list-item
          v-if="portalConfig.contactInformations.website"
          :prepend-icon="mdiWeb"
          :title="portalConfig.contactInformations.websiteLabel || portalConfig.contactInformations.website"
          :href="portalConfig.contactInformations.website"
          target="_blank"
        />
        <v-card-text v-if="element.showSocial && Object.keys(portalConfig.socialLinks).length">
          <v-divider class="mb-2"/>
          <p class="text-caption">{{ t('socialMedia') }}</p>
          <layout-social-links :links="portalConfig.socialLinks" />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Contact } from '#api/types/page-config'
import { mdiPhone, mdiWeb } from '@mdi/js'
import { useAsyncAction } from '@data-fair/lib-vue/async-action.js'

const { element } = defineProps<{ element: Contact }>()
const { t } = useI18n()
const { portalConfig, preview } = usePortalStore()

const newMessage = { from: '', subject: '', text: '' }
const valid = ref(false)
const message = ref({ ...newMessage })

let tokenFetch: ReturnType<typeof useLocalFetch> | undefined
if (!preview) {
  tokenFetch = useLocalFetch('/simple-directory/api/auth/anonymous-action', { watch: false })
}

const sendMessage = useAsyncAction(async () => {
  if (!valid.value || tokenFetch?.error.value) return
  // TODO: send the message
  message.value = { ...newMessage }
}, {
  success: t('messageSent'),
})

</script>

<i18n lang="yaml">
  en:
    email: 'Email'
    message: 'Message'
    messageSent: 'Message sent!'
    send: 'Send'
    socialMedia: 'Find us on social media'
    subject: 'Subject'

  fr:
    email: 'Email'
    message: 'Message'
    messageSent: 'Message envoyé !'
    send: 'Envoyer'
    socialMedia: 'Retrouvez-nous sur les réseaux sociaux'
    subject: 'Sujet'

</i18n>
