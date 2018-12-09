<template>
  <div class="text-center">
    <loading-spinner v-if="isLoading(page)"></loading-spinner>
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
    }
  };
</script>

<style scoped lang="scss">

</style>
