<template>
  <span v-if="availability == 0">sold out</span>
  <span v-else>
    {{availability}} remaining
  </span>
</template>

<script>
  export default {
    name: 'remainingCount',
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
