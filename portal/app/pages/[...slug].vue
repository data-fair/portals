<template>
  <layout-page>
    <page-error :status-code="404" />
  </layout-page>
</template>

<script setup lang="ts">
// Catch-all route, matched last: any url no other page resolves lands here and gets
// the portal 404 (header, footer, custom image) instead of the bare error boundary.
const { clearBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()

// An unknown url has no trail to show
setShowBreadcrumbs(false)
clearBreadcrumbs()
</script>
