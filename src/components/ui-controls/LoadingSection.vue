<template>
  <div>
    <loading-spinner v-if="isLoading(page)"></loading-spinner>

    <div class="row justify-content-sm-center" v-if="isLoading(page)">
      <div class="col text-center mt-5">
        <p>We are loading assets from the Blockchain.</p>
        <p>Please be patient as we are fully decentralised.</p>
      </div>
    </div>
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
