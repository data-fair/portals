<template lang="html">
  <div>
    <!-- <v-container py-0>
      <v-breadcrumbs :items="[{text: 'Les données', to: '/datasets', exact: true}, {text: dataset.title, disabled: true}]"/>
    </v-container>
    <v-divider/> -->
    <error
      v-if="$fetchState.error"
      :error="$fetchState.error"
    />
    <v-container v-else-if="dataset">
      <section-title
        :text="dataset.title"
        tag="h1"
      />
      <v-row>
        <v-col
          :md="config.datasetMetaLayout === 'vertical' ? 12 : 7"
          :cols="12"
        >
          <img
            v-if="dataset.image"
            :src="dataset.thumbnail || dataset.image"
            :alt="dataset.title"
            class="mb-3"
            style="max-height:300px;max-width:95%"
          >
          <div v-html="dataset.description" />
        </v-col>
        <v-col
          :md="config.datasetMetaLayout === 'vertical' ? 12 : 4"
          :offset-md="config.datasetMetaLayout === 'vertical' ? 0 : 1"
          :cols="12"
        >
          <v-card
            class="py-3"
            v-bind="infoCardProps"
          >
            <v-row>
              <v-col
                v-if="!dataset.isMetaOnly"
                :md="config.datasetMetaLayout === 'vertical' ? 4 : 12"
                :cols="12"
                class="py-0"
              >
                <v-list-item
                  style="min-height: 36px;"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      <v-subheader
                        style="height:26px"
                        class="pa-0"
                      >
                        Taille :
                      </v-subheader>
                      {{ (dataset.count || 0).toLocaleString('fr') }} enregistrements
                      <template v-if="dataset.storage && dataset.storage.indexed && dataset.storage.indexed.size">
                        - {{ dataset.storage.indexed.size | bytes }}
                      </template>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-col>

              <!--<v-list-item>
                <v-list-item-content class="py-0">
                  <v-list-item-title style="white-space:normal;">
                    <v-col class="py-0">
                      <topics
                        :topics="dataset.topics"
                        small
                        justify="left"
                        row-class="mt-0 mb-2"
                      />
                    </v-col>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>-->
              <v-col
                v-if="dataset.origin"
                :md="config.datasetMetaLayout === 'vertical' ? 4 : 12"
                :cols="12"
                class="py-0"
              >
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title v-if="dataset.origin && (dataset.origin.startsWith('http://') || dataset.origin.startsWith('https://'))">
                      Données issues de <a
                        :href="dataset.origin"
                        rel="external"
                        class="underline-link"
                      >cette source</a>
                    </v-list-item-title>
                    <v-list-item-title v-else-if="dataset.origin">
                      <v-subheader
                        style="height:26px"
                        class="pa-0"
                      >
                        Données produites par :
                      </v-subheader>
                      <strong>{{ dataset.origin }}</strong>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-col>

              <v-col
                v-if="dataset.owner.department && !config.datasetHideDepartment"
                :md="config.datasetMetaLayout === 'vertical' ? 4 : 12"
                :cols="12"
                class="py-0"
              >
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      <v-avatar
                        :size="28"
                        class="mr-1"
                      >
                        <img :src="`${directoryUrl}/api/avatars/${dataset.owner.type}/${dataset.owner.id}/${dataset.owner.department}/avatar.png`">
                      </v-avatar>
                      {{ dataset.owner.departmentName || dataset.owner.department }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-col>

              <v-col
                v-if="dataset.license"
                :md="config.datasetMetaLayout === 'vertical' ? 4 : 12"
                :cols="12"
                class="py-0"
              >
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      <v-subheader
                        style="height:26px"
                        class="pa-0"
                      >
                        Licence :
                      </v-subheader>
                      <a
                        :href="dataset.license.href"
                        rel="external"
                        class="underline-link"
                      >{{ dataset.license.title }}</a>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-col>

              <v-col
                v-if="dataset.keywords && dataset.keywords.length"
                :md="config.datasetMetaLayout === 'vertical' ? 4 : 12"
                :cols="12"
                class="py-0"
              >
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title style="white-space:normal;">
                      <v-subheader
                        style="height:26px"
                        class="pa-0"
                      >
                        Mots clés :
                      </v-subheader>
                      <v-chip
                        v-for="(keyword,i) in dataset.keywords"
                        :key="i"
                        class="ma-1"
                        small
                        dark
                        :label="!config.radius"
                        :color="readableSecondaryColor"
                      >
                        {{ keyword }}
                      </v-chip>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-col>

              <v-col
                v-if="dataset.spatial"
                :md="config.datasetMetaLayout === 'vertical' ? 4 : 12"
                :cols="12"
                class="py-0"
              >
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title style="white-space:normal;">
                      <v-subheader
                        style="height:26px"
                        class="pa-0"
                      >
                        Couverture géographique :
                      </v-subheader>
                      {{ dataset.spatial }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-col>

              <v-col
                v-if="dataset.temporal && dataset.temporal.start"
                :md="config.datasetMetaLayout === 'vertical' ? 4 : 12"
                :cols="12"
                class="py-0"
              >
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title style="white-space:normal;">
                      <v-subheader
                        style="height:26px"
                        class="pa-0"
                      >
                        Couverture temporelle :
                      </v-subheader>
                      <template v-if="dataset.temporal.end">
                        {{ dataset.temporal.start | date('LL') }} - {{ dataset.temporal.end | date('LL') }}
                      </template>
                      <template v-else>
                        à partir du {{ dataset.temporal.start | date('LL') }}
                      </template>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-col>

              <v-col
                v-if="dataset.frequency"
                :md="config.datasetMetaLayout === 'vertical' ? 4 : 12"
                :cols="12"
                class="py-0"
              >
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title style="white-space:normal;">
                      <v-subheader
                        style="height:26px"
                        class="pa-0"
                      >
                        Fréquence de mise à jour :
                      </v-subheader>
                      {{ frequencies[dataset.frequency] }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-col>
            </v-row>
            <v-divider class="mt-2 mb-3" />
            <v-row
              class="ma-0"
              align="center"
            >
              <v-col
                :md="config.datasetMetaLayout === 'vertical' ? (config.datasetActionsDisplay === 'button' ? 7 : 4) : 12"
                :cols="12"
                class="px-5 py-1"
              >
                <v-row>
                  <v-col
                    v-if="!dataset.isMetaOnly"
                    class="pa-0"
                    :cols="actionsCols"
                  >
                    <table-preview
                      :dataset="dataset"
                      :color="'primary'"
                    />
                  </v-col>
                  <v-col
                    v-if="!dataset.isMetaOnly"
                    class="pa-0"
                    :cols="actionsCols"
                  >
                    <v-btn
                      v-if="config.datasetActionsDisplay === 'button'"
                      text
                      x-small
                      color="primary"
                      :to="{ name: 'datasets-ref-full', params: { ref: $route.params.ref } }"
                    >
                      <v-icon small>
                        mdi-table-large
                      </v-icon>&nbsp;Tableau
                    </v-btn>
                    <action-icon
                      v-else
                      title="Tableau plein écran"
                      icon="mdi-table-large"
                      :to="{ name: 'datasets-ref-full', params: { ref: $route.params.ref } }"
                    />
                  </v-col>
                  <v-col
                    v-if="dataset.bbox && dataset.bbox.length"

                    class="pa-0"
                    :cols="actionsCols"
                  >
                    <map-preview
                      :dataset="dataset"
                      :color="'primary'"
                    />
                  </v-col>
                  <v-col
                    v-if="!isMobileOnly && !dataset.isMetaOnly"
                    class="pa-0"
                    :cols="actionsCols"
                  >
                    <v-btn
                      v-if="config.datasetActionsDisplay === 'button'"
                      text
                      x-small
                      color="primary"
                      :to="{ name: 'datasets-ref-api-doc', params: { ref: $route.params.ref } }"
                    >
                      <v-icon small>
                        mdi-cog
                      </v-icon>&nbsp;API
                    </v-btn>
                    <action-icon
                      v-else
                      title="Documentation d'API"
                      icon="mdi-cog"
                      :to="{ name: 'datasets-ref-api-doc', params: { ref: $route.params.ref } }"
                    />
                  </v-col>
                  <v-col
                    v-if="!dataset.isMetaOnly"

                    class="pa-0"
                    :cols="actionsCols"
                  >
                    <download
                      :dataset="dataset"
                      :color="'primary'"
                    />
                  </v-col>
                  <v-col
                    v-if="!dataset.isMetaOnly"
                    class="pa-0"
                    :cols="actionsCols"
                  >
                    <schema-view
                      :dataset="dataset"
                      :color="'primary'"
                    />
                  </v-col>
                  <v-col
                    v-if="!dataset.isMetaOnly"
                    class="pa-0"
                    :cols="actionsCols"
                  >
                    <dataset-embed
                      :dataset="dataset"
                    />
                  </v-col>
                  <v-col
                    v-if="dataset.attachments && dataset.attachments.filter(a => a.url !== dataset.image).length"
                    class="pa-0"
                    :cols="actionsCols"
                  >
                    <attachments
                      :dataset="dataset"
                      :color="'primary'"
                    />
                  </v-col>
                  <v-col
                    v-if="canLogin && notifyUrl && isPublished"
                    class="pa-0"
                    :cols="actionsCols"
                  >
                    <client-only>
                      <notif-edit
                        :dataset="dataset"
                        :color="'primary'"
                      />
                    </client-only>
                  </v-col>
                </v-row>
              </v-col>
              <v-col
                :md="config.datasetMetaLayout === 'vertical' ? (config.datasetActionsDisplay === 'button' ? 2 : 4) : 12"
                :cols="12"
                class="py-1"
              >
                <v-list-item style="min-height: 36px;">
                  <v-list-item-content class="py-1">
                    <v-list-item-title style="white-space:normal;">
                      <v-subheader
                        class="pa-0"
                        :style="`height:${config.datasetActionsDisplay === 'button' ? 48 : 26}px`"
                      >
                        Mis à jour le {{ dataset.dataUpdatedAt || dataset.updatedAt | date("LL") }}
                      </v-subheader>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-col>

              <v-col
                v-if="dataset && dataset.public"
                :md="config.datasetMetaLayout === 'vertical' ? (config.datasetActionsDisplay === 'button' ? 3 : 4) : 12"
                :cols="12"
                class="py-1"
              >
                <v-row
                  align="center"
                  class="ma-0"
                >
                  <v-subheader
                    style="height:26px"
                  >
                    Partager :
                  </v-subheader>
                  <social :title="dataset.title" />
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      <template v-if="applications">
        <v-row
          v-for="(application, i) in applications.results"
          :key="application.id"
          class="my-3"
          align="center"
        >
          <v-col
            :md="application.preferLargeDisplay ? 12 : 6"
            cols="12"
            class="px-5 py-3"
            :order="0"
            :order-md="application.preferLargeDisplay ? 0 : 1-i%2"
          >
            <nuxt-link
              :to="{name: 'applications-ref', params:{ref: isPublished ? application.slug : application.id}}"
              class="title"
            >
              <span class="underline-link">{{ application.title }}</span>&nbsp;<v-icon color="primary">
                mdi-open-in-new
              </v-icon>
            </nuxt-link>
            <div
              class="mt-3"
              v-html="application.description"
            />
          </v-col>
          <v-col
            :md="application.preferLargeDisplay ? 12 : 6"
            cols="12"
            :order="1"
            :order-md="application.preferLargeDisplay ? 1 : i%2"
          >
            <d-frame-wrapper
              :iframe-title="application.title"
              :src="application.exposedUrl + `?d-frame=true&primary=${encodeURIComponent(readablePrimaryColor)}`"
            />
          </v-col>
        </v-row>
      </template>

      <template v-if="dataset.public && ((uses && uses.length) || (canLogin && config.usesManagement && config.usesManagement.type === 'users'))">
        <section-title
          text="Réutilisations"
        />
        <p v-if="canLogin && config.usesManagement && config.usesManagement.type === 'users'">
          Vous souhaitez faire connaitre une réutilisation de cette donnée ? Rendez vous dans votre <nuxt-link :to="{ name: 'me-uses', query: { dataset: dataset.id } }">
            espace personnel
          </nuxt-link>.
        </p>
        <v-row>
          <v-col
            v-for="use of uses"
            :key="use._id"
            xl="3"
            md="4"
            sm="6"
            cols="12"
          >
            <use-card
              :use="use"
              :link="true"
            />
          </v-col>
        </v-row>
      </template>

      <v-row v-if="iframeExternalReuses.length">
        <v-col
          v-for="(application, er) in iframeExternalReuses"
          :key="er"
          class="text-center"
        >
          <section-subtitle :text="application.title" />
          <iframe
            v-if="application.fixedHeight"
            :title="application.title"
            :src="application.link"
            :height="application.height"
            width="100%"
            class="mt-2"
          />
          <d-frame-wrapper
            v-else
            :iframe-title="application.title"
            :src="application.link"
            class="mt-2"
          />
        </v-col>
      </v-row>
      <template v-if="linkExternalReuses.length">
        <section-title
          text="Réutilisations"
        />
        <v-row>
          <v-col
            v-for="(application, er) in linkExternalReuses"
            :key="er"
            md="4"
            sm="6"
            cols="12"
          >
            <v-card
              outlined
              height="100%"
            >
              <card-title :title="application.title" />
              <v-card-text
                style="height:130px;color: rgba(0,0,0,0.87)"
                class="py-0"
              >
                <client-only>
                  <v-clamp
                    :max-height="130"
                    class="card-gradient-desc130"
                    autoresize
                    v-html="application.description"
                  />
                </client-only>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  :href="application.link"
                  target="_blank"
                  color="primary"
                  text
                >
                  Ouvrir
                </v-btn>
                <v-spacer />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <v-row class="my-4 text-center">
        <v-col
          cols="12"
        >
          <nav-link
            title="retourner à la liste"
            to="/datasets"
            icon="mdi-reply"
          />
        </v-col>
      </v-row>
      <!-- <section-subtitle text="Discussion"/>
      <disqus/> -->
    </v-container>
  </div>
</template>

<script>
// import Disqus from '~/components/disqus.vue'
import TablePreview from '~/components/dataset/table-preview.vue'
import MapPreview from '~/components/dataset/map-preview.vue'
import Download from '~/components/dataset/download.vue'
import NotifEdit from '~/components/dataset/notif-edit.vue'
import SchemaView from '~/components/dataset/schema-view.vue'
import Attachments from '~/components/dataset/dataset-attachments.vue'
import DatasetEmbed from '~/components/dataset/embed.vue'
import Social from '~/components/social'
import Error from '~/components/error.vue'
import { datasetPageHead } from '~/assets/meta-utils'
import { isMobileOnly } from 'mobile-device-detect'
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    // Disqus,
    TablePreview,
    MapPreview,
    Download,
    NotifEdit,
    SchemaView,
    Attachments,
    DatasetEmbed,
    Social,
    Error,
    DFrameWrapper: () => process.client ? import('~/components-no-autoload/d-frame-wrapper.vue') : null
  },
  layout: 'default',
  middleware: 'portal-required',
  data: () => ({
    isMobileOnly,
    dataset: null,
    applications: null,
    uses: null
  }),
  async fetch () {
    const dataset = await this.$axios.$get(`${this.$store.getters.dataFairUrl}/api/v1/datasets/${this.$route.params.ref}`, {
      params: {
        html: true,
        publicationSites: 'data-fair-portals:' + this.portal._id
      }
    })
    this.dataset = dataset

    const params = { select: 'id,slug,title,description,url,bbox,image,preferLargeDisplay', size: 1000, html: true }
    params.dataset = dataset.id
    params.publicationSites = 'data-fair-portals:' + this.portal._id
    const applications = await this.$axios.$get(this.$store.getters.dataFairUrl + '/api/v1/applications', { params })
    if (dataset.extras && dataset.extras.applications) {
      const ordered = dataset.extras.applications.map(appRef => applications.results.find(a => a.id === appRef.id)).filter(a => a)
      const remaining = applications.results.filter(a => !dataset.extras.applications.find(appRef => appRef.id === a.id))
      applications.results = [...ordered, ...remaining]
    }
    this.applications = applications

    this.uses = (await this.$axios.$get(`/api/v1/portals/${this.portal._id}/uses`, {
      params: { select: 'id,title,author,image,publishedAt,published,slug', size: 100, sort: 'publishedAt:-1', dataset: dataset.slug }
    })).results
  },
  head () {
    return datasetPageHead(this.dataset, this.applications, this.pageUrl)
  },
  computed: {
    ...mapState(['config', 'portal', 'publicUrl']),
    ...mapGetters(['primaryColorDark', 'readablePrimaryColor', 'infoCardProps', 'dataFairUrl', 'notifyUrl', 'directoryUrl', 'readableSecondaryColor', 'isPublished']),
    url () {
      return this.publicUrl + '/datasets/' + this.$route.params.ref
    },
    iframeExternalReuses () {
      return (this.dataset && this.dataset.extras && this.dataset.extras.externalReuses && this.dataset.extras.externalReuses.filter(er => er.type === 'embed')) || []
    },
    linkExternalReuses () {
      return (this.dataset && this.dataset.extras && this.dataset.extras.externalReuses && this.dataset.extras.externalReuses.filter(er => er.type === 'link')) || []
    },
    frequencies () {
      return {
        triennial: 'tous les 3 ans',
        biennial: 'tous les 2 ans',
        annual: 'tous les ans',
        semiannual: '2 fois par an',
        threeTimesAYear: '3 fois par an',
        quarterly: 'chaque trimestre',
        bimonthly: 'tous les 2 mois',
        monthly: 'tous les mois',
        semimonthly: '2 fois par mois',
        biweekly: 'toutes les 2 semaines',
        threeTimesAMonth: '3 fois par mois',
        weekly: 'chaque semaine',
        semiweekly: '2 fois par semaine',
        threeTimesAWeek: '3 fois par semaine',
        daily: 'tous les jours',
        continuous: 'en continu',
        irregular: 'irrégulier'
      }
    },
    canLogin () {
      return this.config.authentication !== 'none'
    },
    actionsCols () {
      if (this.config.datasetActionsDisplay !== 'button') return 'auto'
      else return !this.$vuetify.breakpoint.sm ? 4 : 2
    }
  },
  async mounted () {}
}
</script>

<style>
</style>
