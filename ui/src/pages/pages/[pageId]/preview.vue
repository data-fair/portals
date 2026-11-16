<template>
  <!-- the read-only render of the page draft, as the editor previews it (theme of the portal given
       by the "portal" query parameter): the route the page preview of the agents tools renders. No
       form, no navigation drawer, no write on load: it must work for a GET-only session. -->
  <portal-preview-provider>
    <v-sheet
      v-if="pageFetch.data.value"
      color="background"
      class="pa-4"
    >
      <page-elements :model-value="pageFetch.data.value.draftConfig.elements" />
    </v-sheet>
  </portal-preview-provider>
</template>

<script lang="ts" setup>
const { pageFetch } = usePageStore()
</script>
