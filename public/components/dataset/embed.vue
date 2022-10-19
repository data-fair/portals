<template>
  <v-dialog
    v-model="embedDialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    :max-width="1190"
    transition="none"
  >
    <template #activator="{on: onDialog}">
      <action-icon
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
        <pre>
&lt;iframe src="{{ previewLink }}" width="100%" height="300px"
style="background-color: transparent; border: none;" &gt;&lt;/iframe&gt;
        </pre>
        <br>
        Résultat:
        <iframe
          :src="previewLink"
          width="100%"
          height="300px"
          style="background-color: transparent; border: none;"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ['dataset'],
  data () {
    return {
      embedDialog: null,
      previewId: 'table'
    }
  },
  computed: {
    previewLink () {
      return this.dataset && this.dataset.previews.find(p => p.id === this.previewId).href
    }
  }
}

</script>
