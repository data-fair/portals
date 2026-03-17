<template>
  <layout-preview
    :title="t('title') + ' - ' + application.title"
    :action-style="portalConfig.applications.page.metadata?.actionsStyle"
    :icon="mdiCellphoneArrowDown"
    :resource-title="application.title"
    :text="t('text')"
    :short-text="t('shortText')"
    :track-dialog="{ action: 'application-install', label: application.slug }"
  >
    <v-card-text>
      <v-alert
        type="info"
        variant="outlined"
        class="mb-4"
      >
        {{ t('downloadAvailable') }}
      </v-alert>
      <p class="mb-4">
        {{ t('description') }}
      </p>
      <v-code class="d-block mb-6 pa-4">
        <a
          :href="application.exposedUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ application.exposedUrl }}
        </a>
      </v-code>

      <!-- Chrome -->
      <template v-if="browser === 'chrome'">
        <p class="mb-3">
          {{ t('chrome.intro') }}
        </p>
        <ol class="ps-6">
          <li class="mb-2">
            <span>{{ t('chrome.step1.before') }}</span>
            <v-sheet
              border
              rounded
              class="d-inline-flex align-center justify-center pa-1 mx-1"
              elevation="1"
            >
              <v-icon
                :icon="mdiDotsVertical"
                size="small"
              />
            </v-sheet>
            <span>{{ t('chrome.step1.after') }}</span>
          </li>
          <li class="mb-2">
            {{ t('chrome.step2') }}
          </li>
          <li>
            {{ t('chrome.step3') }}
          </li>
        </ol>
      </template>

      <!-- Firefox -->
      <template v-else-if="browser === 'firefox'">
        <p class="mb-3">
          {{ t('firefox.intro') }}
        </p>
        <ol class="ps-6">
          <li class="mb-2">
            <span>{{ t('firefox.step1.before') }}</span>
            <v-sheet
              border
              rounded
              class="d-inline-flex align-center justify-center pa-1 mx-1"
              elevation="1"
            >
              <v-icon
                :icon="mdiDotsVertical"
                size="small"
              />
            </v-sheet>
            <span>{{ t('firefox.step1.after') }}</span>
          </li>
          <li>
            {{ t('firefox.step2') }}
          </li>
        </ol>
      </template>

      <!-- Safari (iOS) -->
      <template v-else-if="browser === 'safari'">
        <p class="mb-3">
          {{ t('safari.intro') }}
        </p>
        <ol class="ps-6">
          <li class="mb-2">
            <span>{{ t('safari.step1.before') }}</span>
            <v-sheet
              border
              rounded
              class="d-inline-flex align-center justify-center pa-1 mx-1"
              elevation="1"
            >
              <v-icon
                :icon="mdiExportVariant"
                size="small"
              />
            </v-sheet>
            <span>{{ t('safari.step1.after') }}</span>
          </li>
          <li class="mb-2">
            {{ t('safari.step2') }}
          </li>
          <li>
            {{ t('safari.step3') }}
          </li>
        </ol>
      </template>

      <!-- Other browsers -->
      <template v-else>
        <p>{{ t('other') }}</p>
      </template>
    </v-card-text>
  </layout-preview>
</template>

<script setup lang="ts">
import { mdiCellphoneArrowDown, mdiDotsVertical, mdiExportVariant } from '@mdi/js'

const { application } = defineProps<{
  application: {
    slug: string
    title: string
    exposedUrl: string
  }
}>()

const { t } = useI18n()
const { portalConfig } = usePortalStore()

type BrowserType = 'chrome' | 'firefox' | 'safari' | 'other'
const browser = ref<BrowserType>('other')

onMounted(() => {
  const ua = navigator.userAgent
  if (/Firefox/.test(ua)) {
    browser.value = 'firefox'
  } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    browser.value = 'safari'
  } else if (/Chrome/.test(ua)) {
    browser.value = 'chrome'
  } else {
    browser.value = 'other'
  }
})
</script>

<i18n lang="yaml">
  en:
    title: Install application
    text: Install on your device
    shortText: Install
    description: Open the link below, then follow the instructions to add it to your home screen.
    downloadAvailable: This application is available for download!
    chrome:
      intro: 'To install this application on your device with Chrome:'
      step1:
        before: 'Tap the'
        after: 'menu in the top right corner.'
      step2: 'Tap "Add to Home Screen".'
      step3: 'Tap "Install".'
    firefox:
      intro: 'To install this application on your device with Firefox:'
      step1:
        before: 'Tap the'
        after: 'menu in the top right corner.'
      step2: 'Tap "Install".'
    safari:
      intro: 'To install this application on your device with Safari:'
      step1:
        before: 'Tap the share button'
        after: 'at the bottom of the screen.'
      step2: 'Scroll down and tap "Add to Home Screen".'
      step3: 'Tap "Add".'
    other: 'Look for an "Install" or "Add to Home Screen" option in your browser menu.'
  fr:
    title: Installer l'application
    text: Installer sur l'appareil
    shortText: Installer
    description: Ouvrez le lien ci-dessous, puis suivez les instructions pour l'ajouter à votre écran d'accueil.
    downloadAvailable: Cette application est disponible en téléchargement !
    chrome:
      intro: 'Pour installer cette application sur votre appareil avec Chrome :'
      step1:
        before: 'Appuyez sur le menu'
        after: 'en haut à droite.'
      step2: "Appuyez sur « Ajouter à l'écran d'accueil »."
      step3: 'Appuyez sur « Installer ».'
    firefox:
      intro: 'Pour installer cette application sur votre appareil avec Firefox :'
      step1:
        before: 'Appuyez sur le menu'
        after: 'en haut à droite.'
      step2: 'Appuyez sur « Installer ».'
    safari:
      intro: 'Pour installer cette application sur votre appareil avec Safari :'
      step1:
        before: 'Appuyez sur le bouton Partager'
        after: "en bas de l'écran."
      step2: "Faites défiler vers le bas et appuyez sur « Sur l'écran d'accueil »."
      step3: 'Appuyez sur « Ajouter ».'
    other: "Recherchez l'option « Installer » ou « Ajouter à l'écran d'accueil » dans le menu de votre navigateur."
</i18n>
