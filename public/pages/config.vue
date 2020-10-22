<template>
  <v-container>
    <section-title text="Configuration du portail" />
    <v-row>
      <v-col :cols="6">
        <v-form>
          <v-jsf
            v-if="config" :schema="schema" :value="config" :options="{httpLib, context: {dataFairUrl, directoryUrl, owner: config.owner && config.owner.id}, requiredMessage: 'Information obligatoire', noDataMessage: 'Aucune valeur correspondante', 'searchMessage': 'Recherchez...'}"
            @change="updateConfig"
          />
        </v-form>
      </v-col>
      <v-col :cols="6">
        <v-card v-for="asset in assets" :key="asset.key" class="px-3 my-3 pt-3" align="center">
          <v-img :height="asset.height" contain :src="assetsUrl+asset.key+'?t='+timestamp" />
          <v-file-input :label="asset.label" style="width:100%" @change="updateAsset(asset, $event)" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VJsf from '@koumoul/vjsf/lib/VJsf.js'
import '@koumoul/vjsf/lib/deps/third-party.js'
import '@koumoul/vjsf/dist/main.css'
const schema = require('../../contract/config.json')
// Object.keys(schema.properties).forEach(k => {
//   if (schema.properties[k].readOnly) delete schema.properties[k]
// })

export default {
  layout: 'minimal',
  middleware: 'superadmin-required',
  components: { VJsf },
  data: () => ({
    config: null,
    schema,
    timestamp: Date.now(),
    assets: [
      { key: 'logo', height: 80, label: 'Logo' },
      { key: 'home', height: 200, label: 'Image d\'accueil' },
      { key: 'favicon', height: 80, label: 'Favicone' }
    ]
  }),
  computed: {
    assetsUrl () {
      return process.env.publicUrl + '/assets/'
    },
    dataFairUrl() {
      return process.env.dataFairUrl
    },
    directoryUrl() {
      return process.env.directoryUrl
    },
    httpLib () {
      return {
        get: async (url, options) => {
          return await this.$axios.get(url, Object.assign({ withCredentials: true }, options))
        }
      }
    }
  },
  mounted: async function () {
    this.config = await this.$axios.$get(process.env.publicUrl + '/api/v1/config')
  },
  methods: {
    async updateConfig () {
      console.log(this.config)
      try {
        await this.$axios.post(process.env.publicUrl + '/api/v1/config', this.config)
        this.$store.dispatch('fetchConfig')
      } catch (error) {
      }
      this.$vuetify.theme.themes.light.primary = this.config.themeColor
    },
    async updateAsset (asset, file) {
      if (file) {
        const formData = new FormData()
        formData.append('asset', file)
        try {
          await this.$axios.put(process.env.publicUrl + '/assets/' + asset, formData)
          this.timestamp = Date.now()
        } catch (error) {
          if (error.response && error.response.status === 413) error.response.data = 'Le fichier est trop volumineux. Veuillez le retravailler pour qu\'il fasse moins de 1 Mo.'
        }
      }
    }
  }
}
</script>
