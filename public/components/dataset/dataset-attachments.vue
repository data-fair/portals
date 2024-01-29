<template>
  <v-dialog
    v-model="dialog"
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
          mdi-attachment
        </v-icon>&nbsp;Pièces jointes
      </v-btn>
      <action-icon
        v-else
        title="Pièces jointes"
        icon="mdi-attachment"
        v-on="onDialog"
      />
    </template>
    <v-card v-if="dialog">
      <v-toolbar
        dense
        flat
      >
        <v-toolbar-title>Pièces jointes</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click.native="dialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="pa-0">
        <v-list class="mb-0">
          <v-list-item
            v-for="(attachment, i) in dataset.attachments.filter(a => a.url !== dataset.image)"
            :key="i"
          >
            <v-list-item-content>
              <v-list-item-title>{{ attachment.title }}</v-list-item-title>
              <v-list-item-subtitle v-if="attachment.type === 'file'">
                <span class="text-caption">{{ attachment.name }} - {{ attachment.size | bytes }} - mis à jour le {{ attachment.updatedAt | date('L') }}</span>
              </v-list-item-subtitle>
              <v-list-item-subtitle v-html="attachment.description" />
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                :href="attachment.url"
                target="_blank"
                download
                icon
                ripple
              >
                <v-icon color="primary">
                  mdi-download
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
const { mapState } = require('vuex')

export default {
  props: ['dataset', 'color'],
  data: () => ({
    dialog: null
  }),
  computed: {
    ...mapState(['config'])
  }
}
</script>
