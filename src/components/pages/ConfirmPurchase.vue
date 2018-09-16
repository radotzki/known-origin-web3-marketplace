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
  import GalleryEdition from '../ui-controls/cards/GalleryEdition';
  import _ from 'lodash';
  import * as actions from '../../store/actions';
  import LoadingSection from "../ui-controls/generic/LoadingSection";
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
      ...mapState([
        'account'
      ]),
      ...mapGetters('kodaV2', [
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
    },
    created() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.CONFIRM_PURCHASE);

      const loadData = function () {
        this.$store.dispatch(`kodaV2/${actions.LOAD_INDIVIDUAL_EDITION}`, {editionNumber: this.$route.params.editionNumber})
          .then(() => {
            return this.$store.dispatch(`kodaV2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account: this.account});
          })
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
    },
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
</style>
