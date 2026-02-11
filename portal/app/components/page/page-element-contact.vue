<template>
  <div :class="element.mb !== 0 && `mb-${element.mb ?? 4}`">
    <v-row>
      <v-col v-if="!tokenFetch?.error.value">
        <v-defaults-provider
          :defaults="{
            VTextField: { rounded: element.rounded ? `${element.rounded} b-0` : undefined },
            VTextarea: { rounded: element.rounded ? `${element.rounded} b-0` : undefined, autoGrow: true },
            VSelect: { rounded: element.rounded ? `${element.rounded} b-0` : undefined },
            VAutocomplete: { rounded: element.rounded ? `${element.rounded} b-0` : undefined },
          }"
        >
          <v-form
            ref="formRef"
            v-model="valid"
          >
            <v-text-field
              v-model="message.from"
              :label="t('email')"
              :rules="[rules.required(), rules.email()]"
            />

            <!-- Additional fields -->
            <template v-if="element.additionalFields && element.additionalFields.length">
              <template
                v-for="(field, index) in element.additionalFields"
                :key="index"
              >
                <!-- Text field -->
                <v-text-field
                  v-if="field.type === 'text'"
                  v-model="additionalData[index]"
                  :label="field.label"
                  :rules="field.required ? [rules.required()] : []"
                  :clearable="!field.required"
                />

                <!-- Select field -->
                <v-select
                  v-else-if="field.type === 'select'"
                  v-model="additionalData[index]"
                  :label="field.label"
                  :items="field.options || []"
                  :rules="field.required ? [rules.required()] : []"
                  :multiple="field.multiple"
                  :clearable="!field.required"
                />

                <!-- Dataset select -->
                <v-autocomplete
                  v-else-if="field.type === 'dataset'"
                  v-model="additionalData[index]"
                  :label="field.label || t('dataset')"
                  :items="datasetsFetch?.data.value?.results ?? []"
                  :loading="datasetsFetch?.status.value === 'pending'"
                  :rules="field.required ? [rules.required()] : []"
                  item-title="title"
                  item-value="id"
                  :clearable="!field.required"
                />

                <!-- Application select -->
                <v-autocomplete
                  v-else-if="field.type === 'application'"
                  v-model="additionalData[index]"
                  :label="field.label || t('application')"
                  :items="applicationsFetch?.data.value?.results ?? []"
                  :loading="applicationsFetch?.status.value === 'pending'"
                  :rules="field.required ? [rules.required()] : []"
                  item-title="title"
                  item-value="id"
                  :clearable="!field.required"
                />
              </template>
            </template>

            <!-- Not show only if explicitly false -->
            <v-text-field
              v-if="element.defaultFields?.enableSubject !== false"
              v-model="message.subject"
              :label="t('subject')"
              :rules="subjectRules"
              :counter="150"
            />
            <v-textarea
              v-if="element.defaultFields?.enableMessage !== false"
              v-model="message.text"
              :label="t('message')"
              :rules="messageRules"
              :counter="msgMaxLength > 0 ? msgMaxLength : undefined"
            />

            <!-- Send button -->
            <div class="d-flex justify-center">
              <v-btn
                :color="buttonConfig?.color"
                :density="buttonConfig?.density"
                :elevation="buttonConfig?.elevation"
                :rounded="buttonConfig?.rounded"
                :variant="buttonConfig?.variant !== 'default' ? buttonConfig?.variant : undefined"
                :class="{ 'text-none': !buttonConfig?.uppercase }"
                :text="t('send')"
                :disabled="!valid"
                :loading="sendMessage.loading.value"
                @click="sendMessage.execute()"
              >
                <template
                  v-if="buttonConfig?.showIcon"
                  #prepend
                >
                  <v-icon :icon="mdiSend" />
                </template>
              </v-btn>
            </div>
          </v-form>
        </v-defaults-provider>
      </v-col>
      <v-col
        v-if="element.showInfo || element.showSocial"
        :cols="12"
        :md="4"
      >
        <v-card
          :elevation="element.elevation"
          :rounded="element.rounded"
        >
          <v-card-text>
            <template v-if="element.showInfo">
              <div
                v-if="portalConfig.contactInformations.infos_html"
                v-html="/*eslint-disable-line vue/no-v-html*/portalConfig.contactInformations.infos_html"
              />
              <v-divider
                v-if="portalConfig.contactInformations.infos_html && (portalConfig.contactInformations.phone || portalConfig.contactInformations.website)"
                class="my-2"
              />

              <!--
                Note that the `title` prop overrides the native `title` attribute,
                which must be set using `v-bind:title.attr` instead.
                See https://vuetifyjs.com/en/api/v-list-item/#props
              -->
              <v-list-item
                v-if="portalConfig.contactInformations.phone"
                :prepend-icon="mdiPhone"
                v-bind="{ 'title': (portalConfig.contactInformations.phoneLabel || portalConfig.contactInformations.phone) + ' - ' + t('newWindow') }"
                :title="portalConfig.contactInformations.phoneLabel || portalConfig.contactInformations.phone"
                :href="`tel:${portalConfig.contactInformations.phone}`"
                target="_blank"
                rel="noopener"
              />
              <v-list-item
                v-if="portalConfig.contactInformations.website"
                :prepend-icon="mdiWeb"
                v-bind="{ 'title': (portalConfig.contactInformations.websiteLabel || portalConfig.contactInformations.website) + ' - ' + t('newWindow') }"
                :title="portalConfig.contactInformations.websiteLabel || portalConfig.contactInformations.website"
                :href="portalConfig.contactInformations.website"
                target="_blank"
                rel="noopener"
              />
            </template>

            <template v-if="element.showSocial && Object.keys(portalConfig.socialLinks).length">
              <v-divider
                v-if="element.showInfo"
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
import type { ContactElement } from '#api/types/page-config'
import { useRules } from 'vuetify/labs/rules'
import { useAsyncAction } from '@data-fair/lib-vue/async-action.js'
import microTemplate from '@data-fair/lib-utils/micro-template.js'
import { mdiPhone, mdiWeb, mdiSend } from '@mdi/js'

const { element } = defineProps<{ element: ContactElement }>()
const rules = useRules() // https://vuetifyjs.com/en/features/rules/
const { t } = useI18n()
const { portalConfig, preview } = usePortalStore()
const url = useRequestURL()

const formRef = ref()
const newMessage = { from: '', subject: '', text: '' }
const valid = ref(false)
const message = ref({ ...newMessage })

const buttonConfig = computed(() => (!element.sendButton?.usePortalConfig && element.sendButton?.config) ? element.sendButton?.config : portalConfig.value.navLinksConfig)

// Default fields config
const msgMinLength = computed(() => {
  const v = element.defaultFields?.messageMinLength ?? 50
  return v === -1 ? 0 : v
})
const msgMaxLength = computed(() => {
  const v = element.defaultFields?.messageMaxLength ?? 3000
  return v === -1 ? 0 : v
})
const subjectRules = computed(() => {
  const r = [rules.minLength(10), rules.maxLength(150)]
  if (element.defaultFields?.requiredSubject !== false) r.push(rules.required())
  return r
})
const messageRules = computed(() => {
  const r = []
  if (element.defaultFields?.requiredMessage !== false) r.push(rules.required())
  if (msgMinLength.value > 0) r.push(rules.minLength(msgMinLength.value))
  if (msgMaxLength.value > 0) r.push(rules.maxLength(msgMaxLength.value))
  return r
})

// Additional fields data
const additionalData = ref<Record<number, string | string[] | undefined>>({})

// Fetch datasets if needed
type DatasetsFetchResult = { results: { id: string, title: string }[] }
let datasetsFetch: ReturnType<typeof useLocalFetch<DatasetsFetchResult>> | undefined
if (element.additionalFields?.some(field => field.type === 'dataset') && !preview) {
  datasetsFetch = useLocalFetch<DatasetsFetchResult>(
    '/data-fair/api/v1/datasets',
    {
      query: { select: 'id,title', size: 1000 },
      watch: false
    }
  )
}

// Fetch applications if needed
type ApplicationsFetchResult = { results: { id: string, title: string }[] }
let applicationsFetch: ReturnType<typeof useLocalFetch<ApplicationsFetchResult>> | undefined
if (element.additionalFields?.some(field => field.type === 'application') && !preview) {
  applicationsFetch = useLocalFetch<ApplicationsFetchResult>(
    '/data-fair/api/v1/applications',
    {
      query: { select: 'id,title', size: 1000 },
      watch: false
    }
  )
}

let tokenFetch: ReturnType<typeof useLocalFetch> | undefined
if (!preview) {
  tokenFetch = useLocalFetch('/simple-directory/api/auth/anonymous-action', { watch: false })
}

const sendMessage = useAsyncAction(async () => {
  if (!valid.value || tokenFetch?.error.value || !tokenFetch?.data.value) return

  // Build template params from all form fields
  const templateParams: Record<string, string> = {
    from: message.value.from,
    subject: message.value.subject || '',
    message: message.value.text || '',
    portalName: portalConfig.value.title || '',
    portalDomain: url.hostname,
  }

  // Add additional field values by their key
  if (element.additionalFields) {
    element.additionalFields.forEach((field, index) => {
      const value = additionalData.value[index]
      if (value !== undefined && value !== null && value !== '') {
        const formattedValue = Array.isArray(value) ? value.join(', ') : String(value)
        if (field.key) {
          templateParams[field.key] = formattedValue
        }
      }
    })
  }

  // Format subject using template or fallback to raw subject
  const formattedSubject = element.subjectTemplate
    ? microTemplate(element.subjectTemplate, templateParams)
    : message.value.subject || t('subject')

  // Format body using template + markdown, or fallback to legacy format
  let formattedBody: string = ''
  if (element.bodyTemplate_html) {
    formattedBody += microTemplate(element.bodyTemplate_html, templateParams)
  } else {
    // Legacy format: additional fields as bold labels + message text
    const additionalFieldsItems: string[] = []
    if (element.additionalFields) {
      element.additionalFields.forEach((field, index) => {
        const value = additionalData.value[index]
        if (value !== undefined && value !== null && value !== '') {
          let label = field.label
          if (!label) {
            if (field.type === 'dataset') label = t('dataset')
            else if (field.type === 'application') label = t('application')
            else label = `field_${index}`
          }
          const formattedValue = Array.isArray(value) ? value.join(', ') : value
          additionalFieldsItems.push(`<li><strong>${label}</strong> : ${formattedValue}</li>`)
        }
      })
    }
    formattedBody += ' ' + t('by') + ' ' + (message.value.from) + '<br>'
    formattedBody += additionalFieldsItems.length ? `<ul>${additionalFieldsItems.join('')}</ul>` : ''
    formattedBody += `<p><strong>${t('messageBody')}</strong><br>${message.value.text}</p>`
  }

  await $fetch('/simple-directory/api/mails/contact', {
    method: 'POST',
    body: {
      token: tokenFetch.data.value,
      from: message.value.from,
      subject: formattedSubject,
      text: formattedBody,
    },
  })

  message.value = { ...newMessage } // Reset form
  additionalData.value = {} // Reset additional fields
  formRef.value?.resetValidation() // Reset validation state
}, {
  success: t('messageSent'),
})

</script>

<i18n lang="yaml">
  en:
    applications: 'Application'
    dataset: 'Dataset'
    email: 'Email'
    message: 'Message'
    messageSent: 'Message sent!'
    messageBody: 'Message body:'
    newWindow: 'New window'
    send: 'Send'
    socialMedia: 'Find us on social media'
    subject: 'Subject'
    by: 'submit by'

  fr:
    applications: 'Visualisation'
    dataset: 'Jeu de données'
    email: 'Email'
    message: 'Message'
    messageSent: 'Message envoyé !'
    messageBody: 'Corps du message :'
    newWindow: 'Nouvelle fenêtre'
    send: 'Envoyer'
    socialMedia: 'Retrouvez-nous sur les réseaux sociaux'
    subject: 'Sujet'
    by: 'émis par'

</i18n>
