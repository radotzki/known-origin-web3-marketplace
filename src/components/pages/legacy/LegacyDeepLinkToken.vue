<template>
  <div class="container">
    <loading-section :page="PAGES.LEGACY_ASSET"></loading-section>

    <div v-if="asset" class="row justify-content-sm-center">
      <div class="col col-sm-6">
        <asset :asset="asset" :key="asset.tokenId"></asset>
      </div>
    </div>

    <div v-if="!isLoading(PAGES.LEGACY_ASSET) && !asset"
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
  import Asset from "../../ui-controls/v1/Asset.vue";
  import {PAGES} from '../../../store/loadingPageState';
  import LoadingSection from "../../ui-controls/generic/LoadingSection";
  import * as actions from '../../../store/actions';

  export default {
    name: 'legacyDeepLinkToken',
    components: {
      LoadingSection,
      Asset
    },
    data() {
      return {
        PAGES: PAGES
      };
    },
    methods: {},
    computed: {
      ...mapGetters('kodaV1', [
        'assetById'
      ]),
      ...mapGetters('loading', [
        'isLoading'
      ]),
      ...mapState([]),
      asset: function () {
        return this.assetById(this.$route.params.legacyTokenId);
      }
    },
    created() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.LEGACY_ASSET);

      const loadData = function () {
        this.$store.dispatch(`kodaV1/${actions.LOAD_LEGACY_TOKEN}`, {legacyTokenId: this.$route.params.legacyTokenId})
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.LEGACY_ASSET);
          });
      }.bind(this);

      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV1,
        () => loadData()
      );

      if (this.$store.state.KnownOriginDigitalAssetV1) {
        loadData();
      }
    },
  };
</script>

<style scoped>

</style>
