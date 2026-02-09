<template>
  <v-dialog
    v-model="embedDialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="1190"
    transition="none"
  >
    <template #activator="{on: onDialog}">
      <v-btn
        text
        x-small
        color="primary"
        style="position:absolute;right:12px;bottom:0px"
        v-on="onDialog"
      >
        <v-icon small>
          mdi-code-tags
        </v-icon>&nbsp;Intégrer
      </v-btn>
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
        style="overflow: auto;"
      >
        Pour intégrer cette page dans un site vous pouvez copier le code suivant ou un code similaire dans le code source HTML.
        <br>
        <code
          class="pa-2 mt-2"
          style="line-height:1.9rem"
        >&lt;iframe src="{{ iframeState ? iframeState.href : previewLink }}" width="100%" height="{{ height }}px" style="background-color: transparent; border: none;"&gt;&lt;/iframe&gt;</code>
        <br>
        Résultat:
        <d-frame-wrapper
          :iframe-title="'Vue embarquée de la page : ' + page.title"
          :src="previewLink"
          :style="'height:'+height+'px'"
          state-change-events
          @state-change="s => iframeState = s"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
const { mapState } = require('vuex')

export default {
  components: {
    DFrameWrapper: () => process.client ? import('~/components-no-autoload/d-frame-wrapper.vue') : null
  },
  props: ['page', 'height'],
  data () {
    return {
      embedDialog: null,
      iframeState: null
    }
  },
  computed: {
    ...mapState(['config', 'publicUrl']),
    previewLink () {
      const search = window && window.location.search
      return this.publicUrl + '/embed/pages/' + this.page.id + (search ? '?' + search : '')
    }
  }
}

</script>
