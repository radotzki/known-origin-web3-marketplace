<template>
  <div class="container">

    <loading-section :page="PAGES.EDITION_TOKEN_OVERVIEW"></loading-section>

    <token-details :edition="edition" v-if="edition"></token-details>

    <div v-if="!isLoading(PAGES.EDITION_TOKEN_OVERVIEW) && !edition"
         class="row justify-content-sm-center">
      <div class="col col-sm-6 text-center">
        <div class="alert alert-secondary" role="alert">
          Sorry, we cant seem to find that asset
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import TokenDetails from '../ui-controls/cards/TokenDetails';
  import {PAGES} from '../../store/loadingPageState';
  import * as actions from '../../store/actions';

  export default {
    name: 'editionTokenOverview',
    components: {
      TokenDetails,
      LoadingSection,
    },
    data() {
      return {
        PAGES: PAGES
      };
    },
    methods: {},
    computed: {
      ...mapGetters('kodaV2', [
        'findPurchasedEdition'
      ]),
      ...mapGetters('loading', [
        'isLoading'
      ]),
      edition: function () {
        return this.findPurchasedEdition({tokenId: this.$route.params.tokenId});
      }
    },
    created() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.EDITION_TOKEN_OVERVIEW);

      const loadData = () => {
        this.$store.dispatch(`kodaV2/${actions.LOAD_INDIVIDUAL_TOKEN}`, {tokenId: this.$route.params.tokenId})
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.EDITION_TOKEN_OVERVIEW);
          });
      };

      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        () => loadData()
      );

      if (this.$store.state.KnownOriginDigitalAssetV2) {
        loadData();
      }
    },
  };
</script>

<style scoped>

</style>
