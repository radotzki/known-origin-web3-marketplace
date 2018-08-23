<template>
  <div class="card shadow-sm" v-if="edition">
    <img class="card-img-top" :src="edition.lowResImg"/>

    <ul class="list-group list-group-flush">
      <li class="list-group-item text-center no-top-border">
        <span class="edition-data float-left">{{ edition.totalAvailable - edition.totalSupply }} available</span>
        <span class="edition-data float-right">1 of {{ edition.totalAvailable }}</span>
      </li>
    </ul>

    <div class="card-body">
      <p class="card-title">{{ edition.otherMeta.artworkName }}</p>
      <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
      <span class="pl-1 artist-name">{{ edition.otherMeta.artist }}</span>

      <p class="card-desc pt-4">{{ edition.description }}</p>

      <small class="text-danger" v-if="isStartDateInTheFuture(edition.startDate)">
        <span>Available {{ edition.startDate | moment('from') }}</span>
      </small>

      <span class="clearfix"></span>
    </div>

    <ul class="list-group list-group-flush">
      <li class="list-group-item text-center no-bottom-border">
        <price-in-eth :value="edition.priceInEther"></price-in-eth>
        <span class="pl-1"><usd-price :price-in-ether="edition.priceInEther"></usd-price></span>
      </li>
    </ul>

    <div class="card-footer text-center"
         v-if="(edition.totalAvailable - edition.totalSupply > 0) && !isStartDateInTheFuture(edition.startDate)">
      <a v-on:click="proceedWithPurchase" class="btn btn-primary btn-block text-white">Buy Now</a>
    </div>

  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import _ from 'lodash';
  import * as actions from '../store/actions';
  import PriceInEth from './ui-controls/PriceInEth';
  import TweetAssetButton from './ui-controls/TweetEditionButton';
  import RarityIndicator from './ui-controls/RarityIndicatorV2';
  import UsdPrice from './ui-controls/USDPrice';
  import MetadataAttributes from './ui-controls/MetadataAttributesV2';
  import HighResLabel from './ui-controls/HighResLabelV2';
  import ConfirmPurchaseButton from './ui-controls/ConfirmPurchaseButton';

  export default {
    name: 'galleryEdition',
    components: {
      ConfirmPurchaseButton,
      HighResLabel,
      UsdPrice,
      RarityIndicator,
      TweetAssetButton,
      PriceInEth,
      MetadataAttributes
    },
    props: {
      edition: {
        type: Object
      }
    },
    computed: {
      ...mapGetters('v2', [
        'isStartDateInTheFuture'
      ]),
      ...mapGetters([
        'findArtistsForAddress'
      ]),
    },
    methods: {
      proceedWithPurchase: function () {
        this.$router.push({
          name: 'completePurchaseV2',
          params: {
            artistAccount: this.edition.artistAccount,
            editionNumber: this.edition.edition
          }
        });
      }
    },
  };
</script>

<style scoped lang="scss">
  .edition-data {
    font-size: 0.75rem;
  }

  li.no-bottom-border {
    border-bottom: 0 none;
  }

  li.no-top-border {
    border-top: 0 none;
  }

  .artist-name {
    font-size: 0.65rem;
  }

  .artist-avatar {
    max-width: 30px;
  }
</style>
