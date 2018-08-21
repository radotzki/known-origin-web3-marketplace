<template>
  <span class="badge badge-light">
    <span v-if="totalAvailable == 1">Ultra rare</span>
    <span v-else-if="totalAvailable > 1 && totalAvailable <= 5">Rare</span>
    <span v-else-if="totalAvailable > 5">Common</span>
  </span>
</template>

<script>
  export default {
    name: 'rarityIndicator',
    props: ['totalAvailable']
  };
</script>

<style scoped>
</style>
