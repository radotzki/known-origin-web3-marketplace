<template>
  <div class="container">
    <h1>Assets <span class="badge badge-primary" v-if="assets.length > 0">{{ assets.length }}</span></h1>

    <loading-spinner v-if="!hasFinishedLoading()"></loading-spinner>

    <div class="card-columns" v-if="assets.length > 0">
      <asset v-for="asset in assets"
             :asset="asset"
             :key="asset.id">
      </asset>
    </div>
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import Artist from '../Artist';
  import Gallery from './Gallery';
  import Asset from '../Asset';
  import AddressIcon from '../ui-controls/AddressIcon';
  import EthAddress from '../ui-controls/EthAddress';
  import LoadingSpinner from "../ui-controls/LoadingSpinner.vue";

  export default {
    name: 'assets',
    components: {
      LoadingSpinner,
      Asset
    },
    methods: {
      hasFinishedLoading: function () {
        // Use the lack of assets in the store to determine initial loading state
        if (this.assets === null) {
          return false;
        }
        return this.assets.length > 0;
      },
    },
    computed: {
      ...mapState([
        'assets'
      ])
    }
  };
</script>

<style scoped>
</style>
