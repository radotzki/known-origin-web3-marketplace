<template>
  <span class="badge badge-light" v-if="availableAssetsForEdition.length > 0">{{ availableAssetsForEdition.length }} available</span>
</template>

<script>
  export default {
    name: 'available',
    props: ['availableAssetsForEdition']
  };
</script>

<style scoped>
</style>
