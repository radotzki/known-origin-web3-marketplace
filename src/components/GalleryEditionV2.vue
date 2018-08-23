<template>
  <div class="card shadow-sm" v-if="edition">
    <img class="card-img-top" :src="edition.lowResImg"/>

    <ul class="list-group list-group-flush">
      <li class="list-group-item text-center">
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

  .card-img-top {
    object-fit: cover;
  }

  .card {
    height: 100%;
  }

  .card-title {
    font-size: 0.9rem;
  }

  .card-desc {
    font-size: 0.75rem;
  }

  .card-body {
    padding: 1rem;
  }

  .card-footer {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .card-target {
    color: inherit;
  }

  a:hover {
    text-decoration: none;
  }

  .sub-filter {
    cursor: pointer;
    padding-left: 3rem;
    padding-right: 3rem;
  }

  .editions-wrap {
    margin-left: 50px;
    margin-right: 50px;
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    .card-deck {
      flex-flow: row wrap;
    }

    .card-img-top {
      object-fit: cover;
      height: 15rem;
    }

    .card {
      width: 18.5rem;
      height: 25rem;
    }

    .full-banner {
      font-size: 1.5rem;
    }

    .sub-filter {
      padding-left: 0.7rem;
      padding-right: 0.7rem;
    }

    .editions-wrap {
      margin-left: -30px;
      margin-right: -30px;
    }
  }

  .artist-name {
    font-size: 0.65rem;
  }

  .artist-avatar {
    max-width: 30px;
  }
</style>
