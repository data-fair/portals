<template>
  <v-container v-if="config">
    <template v-for="(element, i) in (config.elements || []).filter(e => e)">
      <v-row v-if="element.type === 'twoColumns'" :key="i">
        <v-col :cols="12" :md="element.layout === 'left' ? 8 : (element.layout === 'right' ? 4 : 6)">
          <k-element
            v-for="(lElement, li) in element.leftColumn"
            :key="`${i}l${li}`"
            :value="lElement"
          />
        </v-col>
        <v-col :cols="12" :md="element.layout === 'left' ? 4 : (element.layout === 'right' ? 8 : 6)">
          <k-element
            v-for="(rElement, ri) in element.rightColumn"
            :key="`${i}r${ri}`"
            :value="rElement"
          />
        </v-col>
      </v-row>
      <v-row v-else-if="element.type === 'responsiveFlow'" :key="i">
        <v-col
          v-for="(lElement, li) in element.items"
          :key="`${i}l${li}`"
          :cols="12"
          :sm="6"
          :md="4"
        >
          <k-element
            :value="lElement"
          />
        </v-col>
        <v-col :cols="12" :md="element.layout === 'left' ? 4 : (element.layout === 'right' ? 8 : 6)">
          <k-element
            v-for="(rElement, ri) in element.rightColumn"
            :key="`${i}r${ri}`"
            :value="rElement"
          />
        </v-col>
      </v-row>
      <template v-else-if="element.type === 'tabs'">
        <v-tabs :key="'t'+i" v-model="tabs[i]">
          <v-tab v-for="tab in element.tabs" :key="tab.title">
            {{ tab.title }}
          </v-tab>
        </v-tabs>
        <v-tabs-items :key="'ti'+i" v-model="tabs[i]">
          <v-tab-item
            v-for="tab in element.tabs"
            :key="'ti-'+tab.title"
          >
            <k-element
              v-for="(iElement, j) in tab.elements"
              :key="`${i}t${j}`"
              :value="iElement"
            />
          </v-tab-item>
        </v-tabs-items>
      </template>
      <k-element
        v-else
        :key="i"
        :value="element"
      />
    </template>
  </v-container>
</template>

<script>
  import KElement from '~/components/pages/element.vue'

  export default {
    components: { KElement },
    props: ['config'],
    data: () => ({
      tabs: {},
    }),
  }
</script>

<style lang="css"></style>
