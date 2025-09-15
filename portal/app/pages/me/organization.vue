<template>
  <d-frame :src="`/simple-directory/organization/${session.account.value.id}`" />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'personal' })

// TODO: missing redirect urls
// previous version : return `${this.directoryUrl}/organization/${this.activeAccount.id}?redirect=${encodeURIComponent(this.publicUrl + '/me/account')}&main_redirect=${encodeURIComponent(this.mainPublicUrl + '/data-fair')}`
const session = useSessionAuthenticated()
</script>
