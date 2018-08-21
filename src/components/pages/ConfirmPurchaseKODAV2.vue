<template>
  <div class="container">

    <!-- TODO loading -->

    <div class="row justify-content-sm-center">
      <div class="col col-sm-6">
        <gallery-edition :edition="edition"></gallery-edition>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import GalleryEdition from '../GalleryEditionV2';
  import _ from 'lodash';
  import LoadingSpinner from "../ui-controls/LoadingSpinner.vue";
  import * as actions from '../../store/actions';

  export default {
    name: 'confirmPurchase',
    components: {
      LoadingSpinner,
      GalleryEdition,
    },
    computed: {
      ...mapGetters('v2', [
        'findEdition'
      ]),
      edition: function () {
        return this.findEdition(this.$route.params.editionNumber);
      },
      title: function () {
        return `${this.edition.editionName} #${this.edition.edition}`;
      },
    },
    methods: {
      countPurchased: (assets) => {
        return _.filter(assets, (val) => {
          return val.purchased === 1 || val.purchased === 2;
        });
      },
      countAvailable: (assets) => {
        return _.filter(assets, {'purchased': 0});
      },
    },
    mounted: function () {
      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        (newValue, oldValue) => {
          if (newValue) {
            this.$store.dispatch(`v2/${actions.LOAD_SPECIFIC_EDITION}`, {editionNumber: this.$route.params.editionNumber});
          }
        });
    }
  };
</script>

<style scoped lang="scss">
</style>
