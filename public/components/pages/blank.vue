<template>
  <v-container v-if="config">
    <template v-for="(element, i) in config.elements.filter(e => e)">
      <k-element
        v-if="!element.type.includes('Columns')"
        :key="i"
        :value="element"
      />
      <v-row v-if="element.type === 'twoColumns'" :key="i">
        <v-col cols="6">
          <k-element
            v-for="(lElement, li) in element.leftColumn"
            :key="`${i}l${li}`"
            :value="lElement"
          />
        </v-col>
        <v-col cols="6">
          <k-element
            v-for="(rElement, ri) in element.rightColumn"
            :key="`${i}r${ri}`"
            :value="rElement"
          />
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
  import KElement from '~/components/pages/element.vue'

  export default {
    components: { KElement },
    props: ['config'],
  }
</script>

<style lang="css"></style>
