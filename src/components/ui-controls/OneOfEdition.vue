<template>
  <span class="badge badge-light">1 of {{ assetsInEdition.length }}</span>
</template>

<script>
  export default {
    name: 'oneOfEdition',
    props: ['assetsInEdition']
  };
</script>

<style scoped>
</style>
