<template>
  <div class="card shadow-sm" v-if="edition">

    <img class="card-img-top" :src="edition.lowResImg"/>

    <ul class="list-group list-group-flush">
      <li class="list-group-item bg-danger text-center text-white" v-if="availableAssetsForEdition(edition.edition).length == 0">
        SOLD
      </li>
    </ul>

    <div class="card-body">

      <p class="card-text">
        <high-res-label :asset="edition"></high-res-label>

        <rarity-indicator :assets-in-edition="assetsForEdition(edition.edition)"></rarity-indicator>

        <one-of-edition :assets-in-edition="assetsForEdition(edition.edition)"></one-of-edition>

        <available :availableAssetsForEdition="availableAssetsForEdition(edition.edition)"></available>

        <metadata-attributes :attributes="edition.attributes"></metadata-attributes>

        <span class="float-right">
          <tweet-asset-button :edition="edition" v-if="purchase"></tweet-asset-button>
        </span>

        <img src="../../static/nifty.png" style="height: 50px" class="float-right m-2" v-if="edition && edition.attributes && edition.attributes.tags.indexOf('nifty') !== -1"/>
      </p>

      <edition-name-by-artist :edition="edition" :purchase="purchase"></edition-name-by-artist>

      <p class="card-text" v-if="purchase">{{ edition.description  }}</p>

      <small class="text-danger" v-if="isAuctionStartDateInFuture(edition)">
        <span>Available {{ edition.auctionStartDate | moment("from") }}</span>
      </small>

      <span class="clearfix"></span>
    </div>

    <ul class="list-group list-group-flush">
      <li class="list-group-item text-center no-bottom-border">
        <price-in-eth :value="edition.priceInEther"></price-in-eth>
        <span class="pl-1"><usd-price :price-in-ether="edition.priceInEther"></usd-price></span>
      </li>
    </ul>

    <div class="card-footer text-center" v-if="!purchase">
      <router-link class="btn btn-outline-primary btn-block" tag="button" :to="{ name: 'confirmPurchase', params: { artistCode: edition.edition.substring(0, 3), edition: edition.edition }}">
        View details
      </router-link>
    </div>

    <div class="card-footer text-center" v-if="purchase && availableAssetsForEdition(edition.edition).length > 0 && !isAuctionStartDateInFuture(edition)">
      <confirm-purchase-button :edition="edition"></confirm-purchase-button>
    </div>

  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import _ from 'lodash';
  import PriceInEth from './ui-controls/PriceInEth';
  import EditionNameByArtist from './ui-controls/EditionNameByArtist';
  import ConfirmPurchaseButton from './ui-controls/ConfirmPurchaseButton';
  import TweetAssetButton from "./ui-controls/TweetAssetButton";
  import RarityIndicator from "./ui-controls/RarityIndicator";
  import Available from "./ui-controls/Available";
  import OneOfEdition from "./ui-controls/OneOfEdition";
  import UsdPrice from "./ui-controls/USDPrice";
  import MetadataAttributes from "./ui-controls/MetadataAttributes";
  import HighResLabel from "./ui-controls/HighResLabel";

  export default {
    name: 'galleryEdition',
    components: {
      Available,
      HighResLabel,
      UsdPrice,
      RarityIndicator,
      OneOfEdition,
      TweetAssetButton,
      PriceInEth,
      EditionNameByArtist,
      ConfirmPurchaseButton,
      MetadataAttributes
    },
    props: {
      edition: {
        required: true,
        type: Object
      },
      purchase: {
        type: Boolean
      }
    },
    computed: {
      ...mapGetters('assets', [
        'availableAssetsForEdition',
        'assetsForEdition',
        'isAuctionStartDateInFuture'
      ]),
    },
    methods: {
    },
    data () {
      return {
        nowTimestamp: new Date().getTime()
      };
    }
  };
</script>

<style scoped lang="scss">
  li.no-bottom-border {
    border-bottom: 0 none;
  }
</style>
