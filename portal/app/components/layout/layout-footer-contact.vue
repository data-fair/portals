<template>
  <v-container
    :class="[`bg-${portalConfig.footer.color}`, 'pa-0']"
    fluid
  >
    <v-container>
      <v-row>
        <v-col cols="6">
          <p v-if="portalConfig.contactInformations.phone">
            <v-icon :icon="mdiPhone" />
            {{ portalConfig.contactInformations.phoneLabel || portalConfig.contactInformations.phone }}
          </p>
          <p v-if="portalConfig.contactInformations.website">
            <v-icon :icon="mdiWeb" />
            {{ portalConfig.contactInformations.websiteLabel || portalConfig.contactInformations.website }}
          </p>
          <p v-if="standardPagesFetch.data.value?.contact">
            <v-icon :icon="mdiEmail" />
            <NuxtLink to="/contact">{{ t('contactUs') }}</NuxtLink>
          </p>
        </v-col>
        <v-col cols="6">
          <div v-html="/*eslint-disable-line vue/no-v-html*/portalConfig.contactInformations.infos_html" />
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { mdiEmail, mdiPhone, mdiWeb } from '@mdi/js'

const { t } = useI18n()
const { portalConfig } = usePortalStore()

const standardPagesFetch = await useFetch<Record<string, boolean>>('/portal/api/pages/standard-exists', { watch: false })

</script>

<i18n lang="yaml">
  en:
    contactUs: 'Contact Us'
  fr:
    contactUs: 'Contactez-nous'
</i18n>
