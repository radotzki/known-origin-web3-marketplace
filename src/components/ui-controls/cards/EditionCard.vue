<template>
  <div class="shadow-sm bg-white p-4">

    <router-link
      :to="{ name: 'artist-v2', params: { artistAccount: getArtistAddress(findArtistsForAddress(edition.artistAccount)) } }" class="artist-link">
      <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
      <span class="pl-1 artist-name-lg" v-on:click="goToArtist(edition.artistAccount)">{{ findArtistsForAddress(edition.artistAccount).name }}</span>
    </router-link>

    <div class="clearfix"></div>

    <hr/>

    <div>
      <strong>{{ edition.name }}</strong>
    </div>

    <div class="small mt-2">
      {{ edition.description }}
    </div>

    <hr/>

    <!--<small class="text-danger" v-if="isStartDateInTheFuture(edition.startDate)">-->
    <!--<span>Available {{ edition.startDate | moment('from') }}</span>-->
    <!--</small>-->

    <high-res-label :high-res-available="edition.highResAvailable"></high-res-label>

    <rarity-indicator :total-available="edition.totalAvailable"></rarity-indicator>

    <metadata-attributes :attributes="edition.attributes"></metadata-attributes>

    <div class="mt-2">
      <creative-challenge-label :attributes="edition.attributes"></creative-challenge-label>
    </div>

    <div class="small mt-2">
      Edition 1 of {{ edition.totalAvailable }}
      <availability class="float-right" :totalAvailable="edition.totalAvailable"
                    :totalSupply="edition.totalSupply"></availability>
    </div>

    <div class="mt-2">
      <hr/>
      <price-in-eth :value="edition.priceInEther"></price-in-eth>
      <span class="pl-1"><u-s-d-price :price-in-ether="edition.priceInEther"></u-s-d-price></span>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash';

  import { mapGetters, mapState } from 'vuex';
  import ClickableAddress from '../generic/ClickableAddress';
  import Availability from '../v2/Availability';
  import HighResLabel from '../generic/HighResLabel';
  import CreativeChallengeLabel from "../../ui-controls/generic/CreativeChallengeLabel";
  import PriceInEth from '../generic/PriceInEth';
  import MetadataAttributes from '../v2/MetadataAttributes';
  import USDPrice from '../generic/USDPrice';
  import RarityIndicator from '../v2/RarityIndicator';

  export default {
    name: 'edition-card',
    props: ['edition'],
    components: {
      Availability,
      ClickableAddress,
      HighResLabel,
      CreativeChallengeLabel,
      PriceInEth,
      MetadataAttributes,
      USDPrice,
      RarityIndicator
    },
    computed: {
      ...mapGetters([
        'findArtistsForAddress'
      ])
    },
    methods: {
      getArtistAddress: function (artist) {
        if (_.isArray(artist.ethAddress)) {
          return artist.ethAddress[0];
        }
        return artist.ethAddress;
      }
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';

  @import '../../../ko-card.scss';
</style>
