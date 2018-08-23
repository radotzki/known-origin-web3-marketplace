<template>
  <div class="container">

    <loading-section v-if="!edition" :page="PAGES.CONFIRM_PURCHASE"></loading-section>

    <div class="row justify-content-sm-center">
      <div class="col-sm-6">
        <gallery-edition :edition="edition"></gallery-edition>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import GalleryEdition from '../GalleryEditionV2';
  import _ from 'lodash';
  import * as actions from '../../store/actions';
  import LoadingSection from "../ui-controls/LoadingSection";
  import {PAGES} from '../../store/loadingPageState';

  export default {
    name: 'confirmPurchase',
    components: {
      LoadingSection,
      GalleryEdition,
    },
    data() {
      return {
        PAGES: PAGES
      };
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
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.CONFIRM_PURCHASE);

      const loadData = function () {
        this.$store.dispatch(`v2/${actions.LOAD_INDIVIDUAL_EDITION}`, {editionNumber: this.$route.params.editionNumber})
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.CONFIRM_PURCHASE);
          });
      }.bind(this);

      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        () => loadData()
      );

      if (this.$store.state.KnownOriginDigitalAssetV2) {
        loadData();
      }
    }
  };
</script>

<style scoped lang="scss">
</style>
