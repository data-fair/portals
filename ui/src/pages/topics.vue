<template>
  <v-container fluid>
    <h1 class="text-h4 text-center">
      Topics list config matrix
    </h1>

    <div
      v-for="bg in backgrounds"
      :key="bg.key"
      class="mb-12"
    >
      <h2 class="text-h5 mb-4">
        {{ bg.label }}
      </h2>

      <div
        v-for="variant in variants"
        :key="variant.key"
        class="mb-4"
      >
        <h3 class="text-subtitle-1 mb-2">
          {{ variant.label }}
        </h3>

        <v-row
          dense
          class="mb-2"
        >
          <v-col
            cols="12"
            md="2"
            lg="2"
          />
          <v-col
            cols="12"
            md="3"
            lg="3"
            class="text-caption"
          >
            Icon: same as text (unset) (text if selected)
          </v-col>
          <v-col
            cols="12"
            md="3"
            lg="3"
            class="text-caption"
          >
            Icon: thematic (text if selected)
          </v-col>
          <v-col
            cols="12"
            md="3"
            lg="3"
            class="text-caption"
          >
            Icon: primary (text if selected)
          </v-col>
        </v-row>

        <v-row
          v-for="rowColor in colorOptions"
          :key="variant.key + '-' + rowColor.key"
          dense
          class="mb-3"
        >
          <v-col
            cols="12"
            md="2"
            class="text-caption text-right align-self-center"
          >
            {{ rowColor.rowLabel }}
          </v-col>
          <v-col
            v-for="iconColor in colorOptions"
            :key="variant.key + '-' + rowColor.key + '-' + iconColor.key"
            cols="auto"
          >
            <v-card
              :color="bg.cardColor"
              class="pa-3"
            >
              <TopicsListAny
                :topics="topics"
                :link="variant.link"
                :is-filters="variant.isFilters"
                :config="{
                  color: rowColor.value,
                  iconColor: iconColor.value,
                  showIcon: true,
                  centered: variant.centered,
                  elevation: 1,
                  density: 'comfortable',
                  rounded: 'lg'
                }"
              />
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal-config'
import TopicsList from '../../../portal/app/components/topics-list.vue'
import { useTheme } from 'vuetify'

// ignore template type checks for the demo page.
const TopicsListAny = TopicsList as any

// @ts-ignore
const portalConfigDefault: PortalConfig = {
  datasets: {
    card: {},
    page: {}
  },
  applications: {
    card: {},
    page: {}
  },
  reuses: {
    card: {},
    page: {
      datasets: { display: 'card' },
      showImage: true
    }
  },
  socialShares: ['bluesky', 'x', 'facebook', 'linkedin', 'reddit', 'sms', 'whatsapp'],
  contactInformations: {
    infos: '',
    infos_html: '',
    phone: '0123456789',
    phoneLabel: 'Phone',
    website: 'https://example.com',
    websiteLabel: 'Website'
  },
  socialLinks: {
    bluesky: 'example',
    linkedin: 'example'
  },
  personal: {
    navigationColor: 'primary',
    hidePages: [],
    accountPages: []
  },
  breadcrumb: {
    compact: true,
    showHome: true,
    fluid: false,
    separator: {
      type: 'text',
      text: '/'
    }
  }
}

providePortalStore(portalConfigDefault)

onMounted(() => {

})

const vuetifyTheme = useTheme()
const router = useRouter()
onMounted(() => {
  router.replace({
    query: {
      topics: 'topic-a,topic-c'
    }
  })

  // Force a different primary text and background color for testing purposes.
  const currentTheme = vuetifyTheme.global.name.value
  vuetifyTheme.themes.value[currentTheme].colors.primary = 'rgb(140, 185, 255)'
  vuetifyTheme.themes.value[currentTheme].colors['text-primary'] = 'rgb(10, 30, 80)'
})

const topics = [
  {
    id: 'topic-a',
    title: 'Topic A',
    count: 12,
    color: '#E57373',
    icon: {
      svgPath: 'M20.59,13.41L12,4.83V2H4V10.83L12.59,19.41C12.97,19.8 13.58,19.8 13.96,19.41L20.59,12.79C21,12.37 21,11.78 20.59,11.36Z'
    }
  },
  {
    id: 'topic-b',
    title: 'Topic B',
    count: 7,
    color: '#64B5F6',
    icon: {
      svgPath: 'M12,3C7.58,3 4,4.79 4,7V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V7C20,4.79 16.42,3 12,3M12,5C15.87,5 18,6.34 18,7C18,7.66 15.87,9 12,9C8.13,9 6,7.66 6,7C6,6.34 8.13,5 12,5M12,19C8.13,19 6,17.66 6,17V14.97C7.6,15.61 9.74,16 12,16C14.26,16 16.4,15.61 18,14.97V17C18,17.66 15.87,19 12,19M12,14C8.13,14 6,12.66 6,12V9.97C7.6,10.61 9.74,11 12,11C14.26,11 16.4,10.61 18,9.97V12C18,12.66 15.87,14 12,14Z'
    }
  },
  {
    id: 'topic-c',
    title: 'Topic C',
    count: 3,
    color: '#81C784',
    icon: {
      svgPath: 'M3,17H5.5L9,11.5L12,16L16.5,9L21,13.5V17H3M3,19H21V21H3V19Z'
    }
  }
]

const backgrounds = [
  {
    key: 'normal',
    label: 'Normal background'
  },
  {
    key: 'primary',
    label: 'Primary background',
    cardColor: 'primary'
  }
]

const colorOptions = [
  { key: 'unset', rowLabel: 'Color: unset', value: undefined },
  { key: 'default', rowLabel: 'Color: thematic', value: 'default' },
  { key: 'primary', rowLabel: 'Color: primary', value: 'primary' }
]

const variants = [
  {
    key: 'centered',
    label: 'Centered',
    centered: true,
    isFilters: false,
    link: undefined
  },
  {
    key: 'filters',
    label: 'Filters',
    centered: false,
    isFilters: true,
    link: undefined
  },
  {
    key: 'link',
    label: 'Link',
    centered: false,
    isFilters: false,
    link: { type: 'standard', subtype: 'datasets', title: 'Datasets' }
  }
]
</script>
