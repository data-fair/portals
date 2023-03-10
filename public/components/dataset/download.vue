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
    <v-card v-if="dialog">
      <v-toolbar
        dense
        flat
      >
        <v-toolbar-title>{{ dataset.title }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click.native="dialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-list>
        <v-list-item v-if="dataFiles && dataFiles.original">
          <v-list-item-content>
            <v-list-item-title>
              Télécharger les données originales - fichier {{ dataFiles.original.name }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <action-icon
              title="Télécharger les données originales"
              icon=" mdi-download"
              :href="dataFiles.original.url"
              @click="$ma.trackEvent({action: 'download_data_file', label: dataset.id})"
            />
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-if="dataFiles && dataFiles.full">
          <v-list-item-content>
            <v-list-item-title>
              Télécharger les données enrichies - format csv
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <action-icon
              title="Télécharger les données enrichies"
              icon=" mdi-download"
              :href="dataFiles.full.url"
              @click="$ma.trackEvent({action: 'download_data_file', label: dataset.id})"
            />
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-if="dataFiles && dataFiles['export-csv']">
          <v-list-item-content>
            <v-list-item-title>
              {{ `Télécharger les données (export du ${ $dayjs(dataFiles['export-csv'].updatedAt).format('LL') }) - format csv` }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <action-icon
              :title="`Télécharger les données (export du ${ $dayjs(dataFiles['export-csv'].updatedAt).format('LL') })`"
              icon="mdi-download"
              :href="dataFiles['export-csv'].url"
              @click="$ma.trackEvent({action: 'download_data_file', label: dataset.id})"
            />
          </v-list-item-action>
        </v-list-item>
        <template v-if="total <= 1000">
          <v-list-item
            v-for="format in (dataset.bbox ? ['csv', 'xlsx', 'ods', 'geojson'] : ['csv', 'xlsx', 'ods'])"
            :key="format"
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ `Télécharger un export au format ${format}` }}
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <action-icon
                :title="`Télécharger un export au format ${format}`"
                icon="mdi-download"
                :href="downloadUrls[format]"
                @click="clickDownload(format)"
              />
            </v-list-item-action>
          </v-list-item>
        </template>
        <template v-else>
          <v-list
            class="py-0"
            style="position:relative"
          >
            <v-list-item
              target="download"
              :disabled="largeCsvLoading"
            >
              <v-list-item-content>
                <v-list-item-title>
                  Télécharger un export au format csv
                </v-list-item-title>
              <!-- <v-list-item-subtitle>
                Le jeu de données contient plus de 10 000 enregistrements.<br>
                Un export dans ce format n'est possible qu'en filtrant des éléments à partir de la vue tableau.
              </v-list-item-subtitle> -->
              </v-list-item-content>
              <v-list-item-action>
                <action-icon
                  title="Vue tabulaire en plein écran"
                  icon="mdi-download"
                  @click="downloadLargeCSV"
                />
              </v-list-item-action>
            </v-list-item>
            <v-btn
              v-if="largeCsvLoading"
              icon
              title="Annuler"
              color="warning"
              absolute
              right
              style="position:absolute;top:6px;right:8px;"
              @click="cancelLargeCsv"
            >
              <v-icon>mdi-cancel</v-icon>
            </v-btn>
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
          </v-list>
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
          <v-list-item
            v-for="format in (dataset.bbox ? ['xlsx', 'ods', 'geojson'] : ['xlsx', 'ods'])"
            :key="format"
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ `Télécharger un export au format ${format}` }}
              </v-list-item-title>
              <!-- <v-list-item-subtitle>
                Le jeu de données contient plus de 10 000 enregistrements.<br>
                Un export dans ce format n'est possible qu'en filtrant des éléments à partir de la vue tableau.
              </v-list-item-subtitle> -->
            </v-list-item-content>
            <v-list-item-action>
              <action-icon
                title="Vue tabulaire en plein écran"
                icon="mdi-table-large"
                :to="{name: 'datasets-id-full', params:{id: dataset.id}}"
              />
            </v-list-item-action>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-dialog>
</template>

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
    ...mapGetters(['dataFairUrl']),
    downloadUrls () {
      const params = {
        size: 10000,
        page: 1
      }
      delete params.truncate
      const url = `${this.dataFairUrl}/api/v1/datasets/${this.dataset.id}/lines`
      return {
        csv: buildURL(url, { ...params, format: 'csv' }),
        xlsx: buildURL(url, { ...params, format: 'xlsx' }),
        ods: buildURL(url, { ...params, format: 'ods' }),
        geojson: buildURL(url, { ...params, format: 'geojson' })
      }
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
    this.dataFiles = dataFiles.reduce((files, file) => { files[file.key] = file; return files }, {})
    this.total = (await this.$axios.$get(`${this.dataFairUrl}/api/v1/datasets/${this.dataset.id}/lines`, { params: { size: 0 } })).total
  },
  methods: {
    async downloadLargeCSV () {
      this.largeCsvCancelled = false
      this.largeCsvLoading = true
      try {
        const { WritableStream } = await import('web-streams-polyfill/ponyfill')
        const streamSaver = require('streamsaver')
        console.log(streamSaver)
        streamSaver.WritableStream = WritableStream
        streamSaver.mitm = `${this.publicUrl}/streamsaver/mitm.html`
        this.fileStream = streamSaver.createWriteStream(`${this.dataset.id}.csv`)
        this.writer = this.fileStream.getWriter()
        const nbChunks = Math.ceil(this.total / 10000)
        let nextUrl = this.downloadUrls.csv
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
    /* cancel works, but the next download stays in pending state I don't know why */
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
    }
  }
}

</script>
