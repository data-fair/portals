<template>
  <preview :append-title="t(`title.${props.type}`)">
    <template #prepend>
      <v-number-input
        v-model="nbColumns"
        :label="t('nbColumns')"
        :min="1"
        :max="3"
        density="compact"
        max-width="300"
        hide-details
      />
    </template>
    <v-row class="d-flex align-stretch">
      <v-col
        v-for="item in items"
        :key="`${item.id}`"
        :md="12 / nbColumns"
        cols="12"
      >
        <dataset-card
          v-if="props.type === 'dataset'"
          :dataset="item as any"
          :card-config="props.cardConfig"
          is-portal-config
        />
        <application-card
          v-else-if="props.type === 'application'"
          :application="item as any"
          :card-config="props.cardConfig"
          is-portal-config
        />
        <reuse-card
          v-else-if="props.type === 'reuse'"
          :reuse="item as any"
          :card-config="props.cardConfig"
          is-portal-config
        />
      </v-col>
    </v-row>
  </preview>
</template>

<script setup lang="ts">
const { t } = useI18n()
const session = useSessionAuthenticated()

const props = defineProps<{
  appendTitle?: string
  cardConfig: any
  type: 'dataset' | 'application' | 'reuse'
}>()

const nbColumns = ref(2)

const items = computed(() => {
  return Array.from({ length: nbColumns.value }, (_, i) => {
    const position = i + 1
    const title = position === 1 ? t(`${props.type}.longTitle`) : t(`${props.type}.title`, { i: position })
    const baseItem = {
      id: `${props.type}-${position}`,
      slug: `${props.type}-${position}`,
      title,
      summary: t(`${props.type}.summary`),
      owner: session.account.value
    }

    if (props.type === 'dataset') {
      return {
        ...baseItem,
        dataUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        topics: [
          { id: 'topic-1', title: t('topic', { i: 1 }), color: '#45d31d' },
          { id: 'topic-2', title: t('topic', { i: 2 }), color: '#1d8bd3' },
          { id: 'topic-3', title: t('topic', { i: 3 }), color: '#d31d6a' }
        ],
        keywords: [t('dataset.keyword', { i: 1 }), t('dataset.keyword', { i: 2 }), t('dataset.keyword', { i: 3 })],
        isMetaOnly: false
      }
    }

    if (props.type === 'application') {
      return {
        ...baseItem,
        updatedAt: new Date().toISOString(),
        url: `https://example.com/app-${i + 1}`,
        href: `/applications/application-${i + 1}`,
        exposedUrl: `https://example.com/app-${i + 1}`,
        topics: [
          { id: 'topic-1', title: t('topic', { i: 1 }), color: '#45d31d' },
          { id: 'topic-2', title: t('topic', { i: 2 }), color: '#1d8bd3' },
          { id: 'topic-3', title: t('topic', { i: 3 }), color: '#d31d6a' }
        ]
      }
    }

    if (props.type === 'reuse') {
      return {
        ...baseItem,
        config: {
          title: baseItem.title,
          summary: baseItem.summary,
          author: t('reuse.author')
        },
        updatedAt: new Date().toISOString()
      }
    }

    return baseItem
  })
})

</script>

<i18n lang="yaml">
  en:
    nbColumns: 'Number of columns'
    topic: Topic {i}
    title:
      dataset: "Dataset card preview"
      application: "Application card preview"
      reuse: "Reuse card preview"
    dataset:
      title: 'Dataset {i}'
      summary: This is a dataset preview example.
      keyword: Keyword {i}
    application:
      title: 'Application {i}'
      summary: This is an application preview example.
    reuse:
      title: 'Reuse {i}'
      summary: This is a reuse preview example.
      author: "John Doe"
  fr:
    nbColumns: 'Nombre de colonnes'
    title:
      dataset: "Vignette d'un jeu de données"
      application: "Vignette d'une application"
      reuse: "Vignette d'une réutilisation"
    dataset:
      title: 'Jeu de données {i}'
      longTitle: "Voici un jeu de données doté d'un titre particulièrement long, conçu spécifiquement pour tester l'aperçu et observer avec précision comment la vignette tronque le texte selon les différentes configurations de nombres de lignes."
      summary: "Ceci est un exemple de jeu de données pour la prévisualisation."
      keyword: Mot-cle {i}
    application:
      title: 'Application {i}'
      longTitle: "Voici une application dotée d'un titre particulièrement long, conçu spécifiquement pour tester l'aperçu et observer avec précision comment la vignette tronque le texte selon les différentes configurations de nombres de lignes."
      summary: "Ceci est un exemple d'application pour la prévisualisation."
    reuse:
      title: 'Réutilisation {i}'
      longTitle: "Voici une réutilisation dotée d'un titre particulièrement long, conçu spécifiquement pour tester l'aperçu et observer avec précision comment la vignette tronque le texte selon les différentes configurations de nombres de lignes."
      summary: "Ceci est un exemple de réutilisation pour la prévisualisation."
      author: "Jean Dupont"
</i18n>
