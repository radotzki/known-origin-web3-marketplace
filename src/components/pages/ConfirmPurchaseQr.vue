<template>
  <div v-if="edition" class="container">

    <loading-spinner v-if="!edition"></loading-spinner>

    <div class="row justify-content-sm-center" v-if="!edition">
      <div class="col text-center mt-5">
        <p>We are loading assets from the Blockchain.</p>
        <p>Please be patient as we are fully decentralised.</p>
      </div>
    </div>

    <edition-name-by-artist :edition="edition"></edition-name-by-artist>

    <div class="qr-code mt-5">
      <edition-qr-code :edition="edition"></edition-qr-code>
    </div>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import Artist from '../Artist';
  import GalleryEdition from '../GalleryEdition';
  import ConfirmPurchaseButton from '../ui-controls/ConfirmPurchaseButton';
  import EditionNameByArtist from '../ui-controls/EditionNameByArtist';
  import _ from 'lodash';
  import EditionQrCode from '../ui-controls/EditionQrCode';

  export default {
    name: 'confirmPurchase',
    components: {EditionQrCode, GalleryEdition, ConfirmPurchaseButton, EditionNameByArtist},
    computed: {
      ...mapGetters('assets', [
        'firstAssetForEdition'
      ]),
      edition: function () {
        return this.firstAssetForEdition(this.$route.params.edition);
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
    }
  };
</script>

<style scoped>
  img {
    width: auto;
  }

  .qr-code {
    width: 50%;
    text-align: center;
  }
</style>
