<template>
  <v-card
    v-bind="cardProps"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <a
      :href="dataset && `${publicUrl}/datasets/${dataset.id}`"
      :title="dataset && dataset.title"
      target="_blank"
    >
      <card-title
        :title="dataset.title"
        :color-class="titleColorClass"
      />
      <v-card-actions>
        <v-row>
          <v-col
            :cols="6"
            class="py-0"
          >
            <card-topics :topics="dataset && dataset.topics" />
          </v-col>
          <v-col
            :cols="6"
            class="py-0"
          >
            <v-subheader>Mis à jour le {{ dataset.dataUpdatedAt || dataset.updatedAt | date("LL") }}</v-subheader>
          </v-col>
          <v-col
            v-if="!dataset.isMetaOnly"
            :cols="6"
            class="py-0"
          >
            <v-list-item
              style="min-height: 36px;"
            >
              <v-list-item-content class="py-1">
                <v-list-item-title>
                  Volumétrie des données
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ (dataset.count || 0).toLocaleString('fr') }} enregistrements
                  <template v-if="dataset.storage && dataset.storage.indexed && dataset.storage.indexed.size">
                    - {{ dataset.storage.indexed.size | bytes }}
                  </template>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-col>
          <!-- <v-col
            v-if="dataset.origin"
            :cols="6"
            class="py-0"
          >
            <v-list-item>
              <v-list-item-content class="py-1">
                <v-list-item-title>
                  Origine des données
                </v-list-item-title>
                <v-list-item-subtitle>
                  <a
                    v-if="dataset.origin && (dataset.origin.startsWith('http://') || dataset.origin.startsWith('https://'))"
                    :href="dataset.origin"
                    rel="external"
                    class="underline-link"
                  >{{ dataset.origin }}</a>
                  <template v-else>
                    {{ dataset.origin }}
                  </template>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-col> -->
          <v-col
            v-if="dataset.license"
            :cols="6"
            class="py-0"
          >
            <v-list-item>
              <v-list-item-content class="py-1">
                <v-list-item-title>
                  Licence
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ dataset.license.title }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-col>
          <v-col
            v-if="dataset.spatial"
            :cols="6"
            class="py-0"
          >
            <v-list-item>
              <v-list-item-content class="py-1">
                <v-list-item-title>
                  Couverture géographique
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ dataset.spatial }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-col>
          <v-col
            v-if="dataset.temporal && dataset.temporal.start"
            :cols="6"
            class="py-0"
          >
            <v-list-item>
              <v-list-item-content class="py-1">
                <v-list-item-title>
                  Couverture temporelle
                </v-list-item-title>
                <v-list-item-subtitle>
                  <template v-if="dataset.temporal.end">
                    {{ dataset.temporal.start | date('LL') }} - {{ dataset.temporal.end | date('LL') }}
                  </template>
                  <template v-else>
                    à partir du {{ dataset.temporal.start | date('LL') }}
                  </template>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-col>
          <v-col
            v-if="dataset.frequency"
            :cols="6"
            class="py-0"
          >
            <v-list-item>
              <v-list-item-content class="py-1">
                <v-list-item-title>
                  Fréquence de mise à jour
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ frequencies[dataset.frequency] }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-col>
        </v-row>

      </v-card-actions>
    </a>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    dataset: { type: Object, default: null }
  },
  data () {
    return {
      hovered: false
    }
  },
  computed: {
    ...mapState(['config', 'publicUrl']),
    ...mapGetters(['elevation', 'actionCardBackgroundColor']),
    actionCardOptions () {
      return this.config.actionCardOptions
    },
    titleColorClass () {
      let c = ''
      if (this.hovered && this.actionCardOptions.includes('hoverColorTitle')) {
        c += ' primary-darker--text'
      } else {
        c += ' grey--text text--darken-3'
      }
      if (this.actionCardOptions.includes('hoverUnderlineTitle')) {
        c += ' underline-link underline-link-partial'
        if (this.hovered) c += ' underline-link-hover'
      }
      return c
    },
    cardProps () {
      const props = {
        elevation: this.elevation,
        loading: this.loading,
        style: `background-color:${this.actionCardBackgroundColor()}`
      }
      if (this.actionCardOptions.includes('outlined')) props.class = 'also-outlined'
      else props.class = 'not-outlined'

      if (this.actionCardOptions.includes('flat')) props.elevation = 0

      if (this.hovered) {
        if (this.actionCardOptions.includes('hoverElevate')) props.elevation = Math.max(this.elevation * 2, 8)
        if (this.actionCardOptions.includes('hoverColorBorder')) props.class = 'primary-outlined'
      }

      return props
    },
    frequencies () {
      return {
        triennial: 'Tous les 3 ans',
        biennial: 'Tous les 2 ans',
        annual: 'Tous les ans',
        semiannual: '2 fois par an',
        threeTimesAYear: '3 fois par an',
        quarterly: 'Chaque trimestre',
        bimonthly: 'Tous les 2 mois',
        monthly: 'Tous les mois',
        semimonthly: '2 fois par mois',
        biweekly: 'Toutes les 2 semaines',
        threeTimesAMonth: '3 fois par mois',
        weekly: 'Chaque semaine',
        semiweekly: '2 fois par semaine',
        threeTimesAWeek: '3 fois par semaine',
        daily: 'Tous les jours',
        continuous: 'En continu',
        irregular: 'Irrégulier'
      }
    }
  }
}
</script>

<style>
</style>
