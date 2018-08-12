<template>
  <nav v-if="!isOnMainnet"
    class="navbar navbar-expand-md bg-warning sticky-top mt-0 mb-0 justify-content-center">
    <div class="text-danger mt-2">To make real purchases please switch to mainnet!</div>
  </nav>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'networkWarningBanner',
    props: [],
    computed: {
      ...mapGetters(['isOnMainnet'])
    },
  };
</script>

<style scoped>
</style>
