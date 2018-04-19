<template>
  <div class="card" v-if="asset">
    <img class="card-img-top" :src="asset.lowResImg"/>

    <ul class="list-group list-group-flush">
      <li class="list-group-item bg-danger text-center text-white" v-if="asset.purchased != 0 || availableAssetsForEdition(asset.edition).length == 0">
        SOLD
      </li>
    </ul>

    <div class="card-body">

      <p class="card-text"><token-id :value="asset.id"></token-id></p>

      <edition-name-by-artist :edition="asset"></edition-name-by-artist>

      <p class="card-text">{{ asset.otherMeta.description }}</p>
    </div>

    <ul class="list-group list-group-flush">
      <li class="list-group-item">
        <price-in-eth :value="asset.priceInEther"></price-in-eth>
      </li>
    </ul>

    <div class="card-footer">
      <tweet-purchase-button :asset-id="asset.id"></tweet-purchase-button>
    </div>

    <!-- disabled for now until we know more -->
    <!--<hr/>-->
    <!--<div>-->
    <!--<verify-purchase :asset-id="asset.id"></verify-purchase>-->

  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import _ from 'lodash';
  import PurchaseState from './ui-controls/PurchaseState';
  import AddressIcon from './ui-controls/AddressIcon';
  import AssetFigure from './AssetFigure';
  import PriceInEth from './ui-controls/PriceInEth';
  import TokenId from './ui-controls/TokenId';
  import EditionNameByArtist from './ui-controls/EditionNameByArtist';
  import TweetPurchaseButton from "./ui-controls/TweetPurchaseButton.vue";
  import VerifyPurchase from "./ui-controls/VerifyPurchase.vue";

  export default {
    components: {
      VerifyPurchase,
      TweetPurchaseButton,
      AddressIcon,
      PurchaseState,
      AssetFigure,
      PriceInEth,
      EditionNameByArtist,
      TokenId
    },
    name: 'asset',
    props: {
      asset: {
        type: Object
      },
    },
    computed: {
      ...mapGetters([
        'assetsForEdition',
        'availableAssetsForEdition'
      ]),
    }
  };
</script>

<style scoped lang="scss">

</style>
