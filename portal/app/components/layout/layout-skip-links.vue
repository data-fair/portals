<template>
  <div class="layout-skip-links">
    <nav
      role="navigation"
      :aria-label="t('quickAccess')"
      class="bg-surface d-flex ga-4 pa-2 justify-center"
    >
      <a
        v-for="target in targets"
        :key="target.id"
        :href="`#${target.id}`"
        class="text-primary"
        @click.prevent="skipTo(target.id)"
      >
        {{ t(target.labelKey) }}
      </a>
    </nav>
  </div>
</template>

<script setup lang="ts">

interface SkipLinkTarget {
  id: string
  labelKey: string
}

defineProps<{ targets: SkipLinkTarget[] }>()

const { t } = useI18n()

const skipTo = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth' })
  el.focus()
}

</script>

<i18n lang="yaml">
  en:
    quickAccess: 'Quick access'
    content: 'Skip to content'
    navigation: 'Skip to menu'
    footer: 'Skip to footer'
    sidebarNavigation: 'Skip to sidebar navigation'
  fr:
    quickAccess: 'Accès rapide'
    content: 'Aller au contenu'
    navigation: 'Aller au menu'
    footer: 'Aller au pied de page'
    sidebarNavigation: 'Aller à la navigation latérale'
</i18n>

<style scoped>
.layout-skip-links {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  transform: translateY(-100%);
  transition: transform 0.2s ease-in-out;
}

.layout-skip-links:focus-within {
  transform: translateY(0);
}
</style>
