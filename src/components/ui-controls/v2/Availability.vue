<template>
  <span v-if="availability > 0">{{ availability }} available</span>
  <span v-else-if="availability == 0">sold out</span>
</template>

<script>
  export default {
    name: 'availability',
    props: [
      'totalAvailable',
      'totalSupply'
    ],
    computed: {
      availability: function () {
        return this.totalAvailable - this.totalSupply;
      }
    }
  };
</script>

<style scoped lang="scss"></style>
