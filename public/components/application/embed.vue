<template>
  <v-dialog
    v-model="embedDialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="1190"
    transition="none"
  >
    <template #activator="{on: onDialog}">
      <div
        style="min-height:24px"
        v-on="onDialog"
      >
        <v-btn
          v-if="config.applicationActionsDisplay === 'button'"
          text
          x-small
          color="primary"
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
      </div>
    </template>
    <v-card>
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
      <v-card-text>
        Pour intégrer cette application dans un site vous pouvez copier le code suivant dans le contenu HTML de votre site.
        <br>
        <code
          class="pa-2 mt-2"
          style="line-height:1.9rem"
        >&lt;iframe src="{{ embedUrl }}?embed=true" width="100%" height="500px" style="background-color: transparent; border: none;"&gt;&lt;/iframe&gt;</code>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  props: ['application'],
  data () {
    return {
      embedDialog: null
    }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['isPublished']),
    applicationRef () {
      return this.isPublished ? this.application.slug : this.application.id
    },
    embedUrl () {
      return this.$store.getters.dataFairUrl + '/app/' + this.applicationRef
    }
  }
}

</script>
