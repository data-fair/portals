<template>
  <v-dialog
    v-model="embedDialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="1190"
    transition="none"
  >
    <template #activator="{on: onDialog}">
      <v-btn
        v-if="config.datasetActionsDisplay === 'button'"
        text
        x-small
        color="primary"
        v-on="onDialog"
      >
        <v-icon small>
          mdi-code-tags
        </v-icon>&nbsp;Intégrer
      </v-btn>
      <action-icon
        v-else
        title="Intégrer dans un site"
        icon="mdi-code-tags"
        v-on="onDialog"
      />
    </template>
    <v-card outlined>
      <v-toolbar
        dense
        flat
      >
        <v-toolbar-title>Intégrer dans un site</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click.native="embedDialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text
        v-if="embedDialog"
        class="pb-0 px-4"
      >
        Pour intégrer une prévisualisation de ce jeu de données dans un site vous pouvez copier le code suivant ou un code similaire dans le code source HTML.
        <br>
        <v-select
          v-if="dataset.previews && dataset.previews.length > 1"
          v-model="previewId"
          :items="dataset.previews"
          label="Type de prévisualisation"
          item-text="title"
          item-value="id"
          style="max-width: 200px;"
          hide-details
          :menu-props="{offsetY: true}"
        />
        <br>
        <code
          class="pa-2 mt-2"
          style="line-height:1.9rem"
        >&lt;iframe src="{{ iframeState ? iframeState.href : previewLink }}" width="100%" height="500px" style="background-color: transparent; border: none;"&gt;&lt;/iframe&gt;</code>
        <br>
        Résultat:
        <v-iframe
          :title="'Vue tableau du jeu de données : ' + dataset.title"
          :src="previewLink"
          @state="s => iframeState = s"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import VIframe from '@koumoul/v-iframe'
const { mapState } = require('vuex')

export default {
  components: {
    VIframe
  },
  props: ['dataset'],
  data () {
    return {
      embedDialog: null,
      previewId: 'table',
      iframeState: null
    }
  },
  computed: {
    ...mapState(['config']),
    previewLink () {
      return this.dataset && this.dataset.previews.find(p => p.id === this.previewId).href
    }
  }
}

</script>
