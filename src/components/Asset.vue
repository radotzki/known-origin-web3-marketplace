<template>
  <article class="card" v-if="asset">
    <div>
      <asset-figure :edition="asset" :is-asset="true"></asset-figure>
      <div class="card-content">

        <edition-name-by-artist :edition="asset"></edition-name-by-artist>

        <token-id :value="asset.id"></token-id>

        <p class="pad-top">
          <strong>Artwork description</strong><br/>
          {{ asset.otherMeta.description }}
        </p>

        <hr/>

        <price-in-eth :value="asset.priceInEther"></price-in-eth>

        <div class="centered">
          <tweet-purchase-button :asset-id="asset.id"></tweet-purchase-button>
        </div>

        <!-- disabled for now until we know more -->
        <!--<hr/>-->
        <!--<div>-->
          <!--<verify-purchase :asset-id="asset.id"></verify-purchase>-->
        <!--</div>-->
      </div>
    </div>
    <!-- .card-content -->
  </article>

</template>

<script>
  import {mapGetters, mapState} from 'vuex';
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
      ...mapGetters([]),
    }
  };
</script>

<style scoped>

</style>
