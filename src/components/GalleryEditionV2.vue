<template>
  <div class="card shadow-sm" v-if="edition">

    <img class="card-img-top" :src="edition.lowResImg"/>

    <div class="card-body">

      <p class="card-text">

         <high-res-label :asset="edition"></high-res-label>

        <rarity-indicator :total-available="edition.totalAvailable"></rarity-indicator>

        <span class="badge badge-light">1 of {{ edition.totalAvailable }}</span>

        <span class="badge badge-light">{{ edition.totalAvailable - edition.totalSupply }} available</span>

        <metadata-attributes :other-meta="edition.otherMeta"></metadata-attributes>

        <span class="float-right">
          <tweet-asset-button :edition="edition"></tweet-asset-button>
        </span>

        <img src="../../static/nifty.png" style="height: 50px" class="float-right m-2"
             v-if="edition && edition.otherMeta && edition.otherMeta.attributes && edition.otherMeta.attributes.tags.indexOf('nifty') !== -1"/>
      </p>

      <span>
        <h5 class="card-title">{{ edition.otherMeta.artworkName }}</h5>
        <h6 class="card-subtitle mb-2 text-muted">By <router-link
          :to="{ name: 'artist-v2', params: { artistAccount: edition.artistAccount} }">{{ edition.otherMeta.artist }}</router-link></h6>
      </span>

      <p class="card-text">{{ edition.description }}</p>

      <!-- TODO AUCTION START DATE -->

      <span class="clearfix"></span>
    </div>

    <ul class="list-group list-group-flush">
      <li class="list-group-item text-center no-bottom-border">
        <price-in-eth :value="edition.priceInEther"></price-in-eth>
        <span class="pl-1"><usd-price :price-in-ether="edition.priceInEther"></usd-price></span>
      </li>
    </ul>

  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import _ from 'lodash';
  import * as actions from '../store/actions';
  import PriceInEth from './ui-controls/PriceInEth';
  import TweetAssetButton from "./ui-controls/TweetAssetButtonV2";
  import RarityIndicator from "./ui-controls/RarityIndicatorV2";
  import UsdPrice from "./ui-controls/USDPrice";
  import MetadataAttributes from "./ui-controls/MetadataAttributesV2";
  import HighResLabel from "./ui-controls/HighResLabelV2";

  export default {
    name: 'galleryEdition',
    components: {
      HighResLabel,
      UsdPrice,
      RarityIndicator,
      TweetAssetButton,
      PriceInEth,
      MetadataAttributes
    },
    props: {
      edition: {
        required: true,
        type: Object
      }
    },
    computed: {},
    methods: {},
    data() {
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
