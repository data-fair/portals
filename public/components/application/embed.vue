<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn
        icon
        v-on="on"
        @click="embedDialog=true"
      >
        <v-icon :color="'primary'">
          mdi-code-tags
        </v-icon>
      </v-btn>
    </template>
    <span>Intégrer dans un site</span>
    <v-dialog
      v-model="embedDialog"
      :fullscreen="$vuetify.breakpoint.mdAndDown"
      :max-width="1200"
    >
      <v-card>
        <v-toolbar dense flat>
          <v-toolbar-title>Intégrer dans un site</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click.native="embedDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          Pour intégrer cette application dans un site vous pouvez copier le code suivant dans le contenu HTML de votre site.
          <code class="pa-2 mt-2">&lt;iframe src="{{ embedUrl }}?embed=true" width="100%" height="500px" style="background-color: transparent; border: none;"&gt;&lt;/iframe&gt;</code>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-tooltip>
</template>

<script>
  export default {
    props: ['application'],
    data() {
      return {
        embedDialog: null,
      }
    },
    computed: {
      embedUrl() {
        return this.$store.getters.dataFairUrl + '/app/' + this.application.id
      },
    },
  }

</script>
