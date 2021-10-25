<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn
        :disabled="dataset.status === 'error'"
        icon
        text
        v-on="{...on, click: () => dialog = true}"
      >
        <v-icon :color="color || 'primary'">
          mdi-attachment
        </v-icon>
      </v-btn>
    </template>
    <span>Pièces jointes</span>
    <v-dialog
      v-model="dialog"
      :fullscreen="$vuetify.breakpoint.mdAndDown"
      :max-width="1190"
      transition="none"
    >
      <v-card v-if="dialog">
        <v-toolbar dense flat>
          <v-toolbar-title>{{ dataset.title }}</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click.native="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-0">
          <v-list class="mb-0">
            <v-list-item v-for="attachment in dataset.attachments" :key="attachment.name">
              <v-list-item-avatar size="80" class="my-0">
                <v-row>
                  <v-col>
                    <span>{{ attachment.name.split('.').pop().toUpperCase() }}</span>
                    <br>
                    <small>{{ attachment.size | bytes }}</small>
                    <!-- <v-icon :class="[item.iconClass]">{{ item.icon }}</v-icon> -->
                  </v-col>
                </v-row>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ attachment.title || attachment.name }} - <small>Mis à jour le {{ $dayjs(attachment.updatedAt).format("DD/MM/YYYY") }}</small></v-list-item-title>
                <v-list-item-sub-title>{{ attachment.description }}</v-list-item-sub-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  :href="baseUrl+'/'+attachment.name"
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
  </v-tooltip>
</template>

<script>
  export default {
    props: ['dataset', 'color'],
    data: () => ({
      dialog: null,
    }),
    computed: {
      baseUrl () {
        return `${this.$store.getters.dataFairUrl}/api/v1/datasets/${this.dataset.id}/metadata-attachments`
      },
    },
  }
</script>
