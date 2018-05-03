<template>
  <div v-if="edition" class="container">
    <edition-name-by-artist :edition="edition"></edition-name-by-artist>

    <div class="qr-code mt-5">
      <edition-qr-code :edition="edition"></edition-qr-code>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
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
      ...mapGetters([
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
