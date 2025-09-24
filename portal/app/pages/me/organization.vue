<template>
  <!-- TODO: Redirect to the true back-office -->
  <d-frame :src="`/simple-directory/organization/${session.account.value.id}?redirect=${encodeURIComponent(url.origin + '/me/account')}&main_redirect=${encodeURIComponent(url.origin + '/data-fair')}`" />
</template>

<script setup lang="ts">
const session = useSessionAuthenticated()
const url = useRequestURL()

</script>
