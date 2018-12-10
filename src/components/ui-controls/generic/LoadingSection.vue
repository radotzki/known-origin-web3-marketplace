<template>
  <div class="text-center">
    <loading-spinner v-if="isLoading(page)" :id="uuid"></loading-spinner>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex';
  import LoadingSpinner from "./LoadingSpinner";

  export default {
    components: {LoadingSpinner},
    name: 'loadingSection',
    props: ['page'],
    computed: {
      ...mapGetters('loading', [
        'isLoading'
      ]),
    },
    data() {
      return {
        // We gen a random ID to bind the popup to
        uuid: Math.floor(Math.random() * Math.floor(1000))
      };
    },
  };
</script>

<style scoped lang="scss">

</style>
