<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="800"
    transition="none"
  >
    <template #activator="{on: onDialog}">
      <action-icon
        title="Téléchargement des données"
        icon="mdi-download"
        v-on="onDialog"
      />
    </template>
    <v-card
      v-if="dialog"
      :loading="!dataFiles"
    >
      <v-toolbar
        dense
        flat
      >
        <v-toolbar-title>Téléchargement des données - {{ dataset.title }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click.native="dialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-list v-if="dataFiles">
        <!-- direct links to data files-->
        <v-list-item
          v-for="(dataFile, i) of dataFiles"
          :key="i"
        >
          <v-list-item-content>
            <v-list-item-title>
              {{ dataFile.title }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="dataFile.key === 'normalized' || dataFile.key.startsWith('export-')">
              {{ $t('formatSubtitles.' + dataFile.format) }}
            </v-list-item-subtitle>
            <v-list-item-subtitle v-else>
              {{ dataFile.name }} ({{ dataFile.size | bytes }})
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <action-icon
              :title="dataFile.title"
              icon=" mdi-download"
              :href="dataFile.url"
              @click="$event => { $ma.trackEvent({action: 'download_data_file', label: dataset.id}); menu = false }"
            />
          </v-list-item-action>
        </v-list-item>

        <!-- download of large CSV in 10000 lines chunks -->
        <template v-if="total > 10000 && !hasNormalizedCSV">
          <v-list-item
            target="download"
          >
            <v-list-item-content>
              <v-list-item-title>
                Export CSV
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ $t('formatSubtitles.csv') }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <action-icon
                v-if="largeCsvLoading"
                title="Annuler le téléchargement"
                color="warning"
                icon="mdi-cancel"
                @click="cancelLargeCsv"
              />
              <action-icon
                v-else
                title="Export CSV"
                icon="mdi-download"
                @click="downloadLargeCSV"
              />
            </v-list-item-action>
          </v-list-item>
          <div style="height:4px;width:100%;">
            <v-progress-linear
              v-if="largeCsvLoading"
              :buffer-value="largeCsvBufferValue"
              :value="largeCsvValue"
              stream
              height="4"
              style="margin:0;"
            />
          </div>
        </template>

        <!-- download of formats exported by API when <= 10000 lines -->
        <v-list-item
          v-for="format in simpleExports"
          :key="format"
        >
          <v-list-item-content>
            <v-list-item-title>
              {{ `Export ${format.toUpperCase()}` }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t('formatSubtitles.' + format) }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <action-icon
              :title="`Export ${format.toUpperCase()}`"
              icon="mdi-download"
              :href="downloadUrl(format)"
              @click="clickDownload(format)"
            />
          </v-list-item-action>
        </v-list-item>

        <!-- link to table vue for filtered exports -->
        <template v-if="total > 10000">
          <v-alert
            type="warning"
            tile
            dense
            text
            :icon="false"
            class="my-0"
          >
            Le jeu de données contient plus de 10 000 enregistrements.<br>
            Un export dans les formats ci-dessous n'est possible qu'en filtrant des éléments à partir de la vue tableau.
          </v-alert>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                {{ `Export filtré aux formats ${joinAnd(dataset.bbox ? ['xlsx', 'ods', 'geojson'] : ['xlsx', 'ods'])}` }}
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <action-icon
                title="Vue tabulaire en plein écran"
                icon="mdi-table-large"
                :to="{name: 'datasets-ref-full', params:{ref: datasetRef}}"
              />
            </v-list-item-action>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<i18n lang="yaml">
fr:
  formatSubtitles:
    csv: format textuel pour tous logiciels tableurs (séparateur ",")
    xlsx: format adapté pour Excel
    ods: format adapté pour Libre Office et autres logiciels tableurs libres
    geojson: format portable pour données géographiques
</i18n>

<script>
import buildURL from 'axios/lib/helpers/buildURL'
import eventBus from '~/event-bus'
const { mapState, mapGetters } = require('vuex')
const LinkHeader = require('http-link-header')

export default {
  props: ['dataset', 'color'],
  data () {
    return {
      dataFiles: null,
      dialog: null,
      total: 0,
      largeCsvLoading: false,
      largeCsvBufferValue: 0,
      largeCsvValue: 0,
      largeCsvCancelled: false
    }
  },
  computed: {
    ...mapState(['config', 'publicUrl']),
    ...mapGetters(['dataFairUrl', 'isPublished']),
    datasetRef () {
      return this.isPublished ? this.dataset.slug : this.dataset.id
    },
    hasNormalizedCSV () {
      if (!this.dataFiles) return true
      if (this.dataFilesObj.normalized && this.dataFilesObj.normalized.mimetype === 'text/csv') {
        return true
      }
      if (this.dataFilesObj.full && this.dataFilesObj.full.mimetype === 'text/csv') {
        return true
      }
      if (this.dataFilesObj['export-csv']) {
        return true
      }
      return false
    },
    hasNormalizedGeojson () {
      if (!this.dataFiles) return true
      if (this.dataFilesObj.normalized && this.dataFilesObj.normalized.mimetype === 'application/geo+json') {
        return true
      }
      if (this.dataFilesObj.full && this.dataFilesObj.full.mimetype === 'application/geo+json') {
        return true
      }
      if (this.dataFilesObj['export-geojson']) {
        return true
      }
      return false
    },
    simpleExports () {
      if (this.total > 10000 || !this.dataFiles) return []
      const exports = []
      if (!this.hasNormalizedCSV) exports.push('csv')
      exports.push('xlsx')
      exports.push('ods')
      if (!this.hasNormalizedGeojson && this.dataset.bbox) exports.push('geojson')
      return exports
    }
  },
  watch: {
    dialog () {
      const viewName = this.dialog ? `/datasets/${this.dataset.id}/download-dialog` : this.$route.path
      if (this.$ma) this.$ma.trackView({ viewName })
    }
  },
  async mounted () {
    const dataFiles = await this.$axios.$get(`${this.dataFairUrl}/api/v1/datasets/${this.dataset.id}/data-files`)
    for (const dataFile of dataFiles) {
      dataFile.format = dataFile.mimetype.split('/').pop().replace('+', '')
    }
    this.dataFiles = dataFiles
    this.dataFilesObj = this.dataFiles.reduce((obj, df) => { obj[df.key] = df; return obj }, {})
    this.total = (await this.$axios.$get(`${this.dataFairUrl}/api/v1/datasets/${this.dataset.id}/lines`, { params: { size: 0 } })).total
  },
  methods: {
    async downloadLargeCSV () {
      this.largeCsvCancelled = false
      this.largeCsvLoading = true
      try {
        const { WritableStream } = await import('web-streams-polyfill/ponyfill')
        const streamSaver = require('streamsaver')
        streamSaver.WritableStream = WritableStream
        streamSaver.mitm = `${this.publicUrl}/streamsaver/mitm.html`
        this.fileStream = streamSaver.createWriteStream(`${this.dataset.id}.csv`)
        this.writer = this.fileStream.getWriter()
        const nbChunks = Math.ceil(this.total / 10000)
        let nextUrl = this.downloadUrl('csv')
        for (let chunk = 0; chunk < nbChunks; chunk++) {
          if (this.largeCsvCancelled) break
          this.largeCsvBufferValue = ((chunk + 1) / nbChunks) * 100
          let res
          try {
            res = await this.$axios.get(nextUrl)
          } catch (err) {
            // 1 retry after 10s for network resilience, short service interruption, etc
            await new Promise(resolve => setTimeout(resolve, 10000))
            res = await this.$axios.get(nextUrl)
          }

          const { data, headers } = res
          if (headers.link) {
            const next = new URL(LinkHeader.parse(headers.link).rel('next')[0].uri)
            next.searchParams.set('header', false)
            nextUrl = next.href
          }
          await this.writer.write(new TextEncoder().encode(data))
          this.largeCsvValue = ((chunk + 1) / nbChunks) * 100
        }
        if (!this.largeCsvCancelled) {
          this.writer.close()
          this.clickDownload('csv')
        }
      } catch (error) {
        if (!this.largeCsvCancelled && !!error) {
          console.log('download large csv error', error)
          eventBus.$emit('notification', { error })
        }
      }
      this.largeCsvLoading = false
      this.largeCsvCancelled = false
      this.largeCsvBufferValue = 0
      this.largeCsvValue = 0
    },
    async cancelLargeCsv () {
      this.largeCsvCancelled = true
      if (this.writer) {
        this.writer.releaseLock()
        this.fileStream.abort()
      }
    },
    clickDownload (format) {
      if (this.$ma) this.$ma.trackEvent({ action: 'download_filtered', label: `${this.dataset.id} - ${format}` })
      this.menu = false
    },
    downloadUrl (format) {
      const params = {
        size: 10000,
        page: 1,
        format
      }
      const url = `${this.dataFairUrl}/api/v1/datasets/${this.dataset.id}/lines`
      return buildURL(url, params)
    },
    joinAnd (array, sep = ', ', lastSep = ' et ') {
      let str = ''
      for (let i = 0; i < array.length; i++) {
        str += array[i].toUpperCase()
        if (i === array.length - 1) {
          // nothing
        } else if (i === array.length - 2) {
          str += lastSep
        } else {
          str += sep
        }
      }
      return str
    }
  }
}

</script>
