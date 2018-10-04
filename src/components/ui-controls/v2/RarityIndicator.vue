<template>
  <div class="tag">
    <span v-if="totalAvailable === 1">#ultrarare</span>
    <span v-else-if="totalAvailable > 1 && totalAvailable <= 5">#rare</span>
    <span v-else-if="totalAvailable > 5">#common</span>
  </div>
</template>

<script>
  export default {
    name: 'rarityIndicator',
    props: ['totalAvailable']
  };
</script>

<style scoped>
</style>
