<template>
  <div class="card shadow-sm" v-if="edition">
    <img class="card-img-top" :src="edition.lowResImg"/>

    <ul class="list-group list-group-flush">
      <li class="list-group-item text-center no-top-border">
        <span class="edition-data float-left">
          <availability :total-available="edition.totalAvailable" :total-supply="edition.totalSupply"></availability>
        </span>
        <span class="edition-data float-right">1 of {{ edition.totalAvailable }}</span>
      </li>
    </ul>

    <div class="card-body">
      <p class="card-title">{{ edition.name }}</p>

      <router-link :to="{ name: 'artist-v2', params: { artistAccount: findArtistsForAddress(edition.artistAccount).ethAddress } }">
        <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
        <span class="pl-1 artist-name-lg" v-on:click="goToArtist(edition.artistAccount)">{{ findArtistsForAddress(edition.artistAccount).name }}</span>
      </router-link>

      <p class="card-full-desc pt-4">
        {{ edition.description }}
      </p>

      <small class="text-danger" v-if="isStartDateInTheFuture(edition.startDate)">
        <span>Available {{ edition.startDate | moment('from') }}</span>
      </small>

      <high-res-label :high-res-available="edition.highResAvailable"></high-res-label>

      <rarity-indicator :total-available="edition.totalAvailable"></rarity-indicator>

      <metadata-attributes :attributes="edition.attributes"></metadata-attributes>

      <span class="clearfix"></span>
    </div>

    <ul class="list-group list-group-flush">
      <li class="list-group-item text-center no-bottom-border">
        <price-in-eth :value="edition.priceInEther"></price-in-eth>
        <span class="pl-1"><usd-price :price-in-ether="edition.priceInEther"></usd-price></span>
      </li>
    </ul>

    <div class="card-footer text-center"
         v-if="(edition.totalAvailable - edition.totalSupply > 0)
         && !isStartDateInTheFuture(edition.startDate)
         && haveNotPurchasedEditionBefore(edition.edition)">
      <a v-on:click="proceedWithPurchase" class="btn btn-primary btn-block text-white">Buy Now</a>
    </div>

    <div v-if="(edition.totalAvailable - edition.totalSupply > 0) && haveNotPurchasedEditionBefore(edition.edition)">
      <artist-accepting-bids :edition="edition"></artist-accepting-bids>
    </div>

    <div class="card-footer" v-if="!haveNotPurchasedEditionBefore(edition.edition)">
      <p class="text-center pt-2">
        It looks like you have already purchased this edition!
      </p>
      <router-link :to="{ name: 'account'}" tag="button" class="btn btn-outline-primary btn-block">
        View account
      </router-link>
    </div>

  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import _ from 'lodash';
  import * as actions from '../../../store/actions';
  import PriceInEth from '../generic/PriceInEth';
  import UsdPrice from '../generic/USDPrice';
  import RarityIndicator from '../v2/RarityIndicator';
  import MetadataAttributes from '../v2/MetadataAttributes';
  import HighResLabel from '../generic/HighResLabel';
  import Availability from "../v2/Availability";
  import TweetEditionButton from "../v2/TweetEditionButton";
  import ArtistAcceptingBids from "../auction/ArtistAcceptingBids";

  export default {
    name: 'galleryEdition',
    components: {
      ArtistAcceptingBids,
      Availability,
      HighResLabel,
      UsdPrice,
      RarityIndicator,
      PriceInEth,
      MetadataAttributes,
      TweetEditionButton
    },
    props: {
      edition: {
        type: Object
      }
    },
    computed: {
      ...mapGetters('kodaV2', [
        'isStartDateInTheFuture',
        'haveNotPurchasedEditionBefore',
      ]),
      ...mapGetters([
        'findArtistsForAddress'
      ]),
    },
    methods: {
      proceedWithPurchase: function () {
        this.$router.push({
          name: 'completePurchase',
          params: {
            artistAccount: this.edition.artistAccount,
            editionNumber: this.edition.edition
          }
        });
      },
      goToArtist: function (artistAccount) {
        this.$router.push({name: 'artist-v2', params: {artistAccount}});
      }
    },
  };
</script>

<style scoped lang="scss">
  .edition-data {
    font-size: 0.75rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .card-full-desc {
    font-size: 1rem;
  }

  li.no-bottom-border {
    border-bottom: 0 none;
  }

  li.no-top-border {
    border-top: 0 none;
  }

  a {
    text-decoration: none;
  }
</style>
