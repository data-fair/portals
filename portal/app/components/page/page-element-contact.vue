<template>
  <div :class="element.mb !== 0 && `mb-${element.mb ?? 4}`">
    <v-row>
      <v-col v-if="!tokenFetch?.error.value">
        <v-form v-model="valid">
          <v-text-field
            v-model="message.from"
            :label="t('email')"
            :rules="[rules.required(), rules.email()]"
          />
          <v-text-field
            v-model="message.subject"
            :label="t('subject')"
            :rules="[rules.required(), rules.minLength(10), rules.maxLength(150)]"
            :counter="150"
          />
          <v-textarea
            v-model="message.text"
            :label="t('message')"
            :rules="[rules.required(), rules.minLength(50), rules.maxLength(3000)]"
            :counter="3000"
          />
          <div class="d-flex justify-center">
            <v-btn
              :disabled="!valid"
              :loading="sendMessage.loading.value"
              color="primary"
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
            <template v-if="element.showInfo">
              <div
                v-if="portalConfig.contactInformations.infos"
                v-html="portalConfig.contactInformations.infos"
              />
              <v-divider
                v-if="portalConfig.contactInformations.infos"
                class="my-2"
              />

              <v-list-item
                v-if="portalConfig.contactInformations.phone"
                :prepend-icon="mdiPhone"
                :title="portalConfig.contactInformations.phoneLabel || portalConfig.contactInformations.phone"
                :href="`tel:${portalConfig.contactInformations.phone}`"
                target="_blank"
                rel="noopener"
              />
              <v-list-item
                v-if="portalConfig.contactInformations.website"
                :prepend-icon="mdiWeb"
                :title="portalConfig.contactInformations.websiteLabel || portalConfig.contactInformations.website"
                :href="portalConfig.contactInformations.website"
                target="_blank"
                rel="noopener"
              />
            </template>

            <template v-if="element.showSocial && Object.keys(portalConfig.socialLinks).length">
              <v-divider
                v-if="portalConfig.contactInformations.phone || portalConfig.contactInformations.website"
                class="my-2"
              />
              <p class="text-caption">{{ t('socialMedia') }}</p>
              <social-links :links="portalConfig.socialLinks" />
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { Contact } from '#api/types/page-config'
import { useRules } from 'vuetify/labs/rules'
import { useAsyncAction } from '@data-fair/lib-vue/async-action.js'
import { mdiPhone, mdiWeb } from '@mdi/js'

const { element } = defineProps<{ element: Contact }>()
const rules = useRules() // https://vuetifyjs.com/en/features/rules/
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
  if (!valid.value || tokenFetch?.error.value || !tokenFetch?.data.value) return

  await $fetch('/simple-directory/api/mails/contact', {
    method: 'POST',
    body: {
      token: tokenFetch.data.value,
      from: message.value.from,
      subject: message.value.subject,
      text: message.value.text
    },
  })

  message.value = { ...newMessage } // Reset form
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
