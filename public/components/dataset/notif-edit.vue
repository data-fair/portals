<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn
        icon
        v-on="{...on, click: () => dialog = true}"
        @click="dialog=true"
      >
        <v-icon :color="color || 'primary'">
          mdi-bell
        </v-icon>
      </v-btn>
    </template>
    <span>Notifications</span>
    <v-dialog
      v-model="dialog"
      :fullscreen="$vuetify.breakpoint.mdAndDown"
      :max-width="500"
    >
      <v-card v-if="dialog">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ dataset.title }}</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click.native="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-iframe aspect-ratio="0.1" :src="`${notifyUrl}/embed/subscribe?key=${encodeURIComponent(keys)}&title=${encodeURIComponent(titles)}`" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-tooltip>
</template>

<script>
  import 'iframe-resizer/js/iframeResizer'
  import VIframe from '@koumoul/v-iframe'

  export default {
    components: { VIframe },
    props: ['dataset', 'color'],
    data() {
      return {
        dialog: null,
      }
    },
    computed: {
      notifyUrl() {
        return this.$store.state.notifyUrl
      },
      keys() {
        return [`data-fair:dataset:${this.dataset.id}:data-updated`]
      },
      titles() {
        return 'mise à jour des données'
      },
    },
  }

</script>
