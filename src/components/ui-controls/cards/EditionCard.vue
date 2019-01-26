<template>
  <div class="shadow-sm bg-white p-4">
    <router-link
      :to="{ name: 'artist', params: { artistAccount: artistAddress } }"
      class="artist-link">
      <img :src="findArtistsForAddress(edition.artistAccount).logo" class="artist-avatar" alt="artist-logo"/>
      <span class="pl-1 artist-name-lg">{{ (findArtistsForAddress(edition.artistAccount) ).name }}</span>
    </router-link>

    <div class="clearfix"></div>

    <hr/>

    <div>
      <strong>{{ edition.name }}</strong>
    </div>

    <div class="small mt-2">
      {{ edition.description }}
    </div>

    <div class="small" v-if="edition && edition.tokenId">
      <hr/>
      <div class="row">
        <div class="col text-left">
          <token-id-badge :token-id="edition.tokenId"></token-id-badge>
        </div>
        <div class="col text-right">
          <x-of-x-badge :edition="edition"></x-of-x-badge>
        </div>
      </div>
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

    <div class="small mt-2" v-if="edition && !edition.tokenId">
      Edition 1 of {{ edition.totalAvailable }}
      <availability class="float-right" :totalAvailable="edition.totalAvailable"
                    :totalSupply="edition.totalSupply"></availability>
    </div>

    <hr/>

    <div class="text-center">
      <erc721-badge></erc721-badge>
      <ipfs-badge :edition="edition"></ipfs-badge>
      <birth-transaction-badge :edition="edition"></birth-transaction-badge>
      <purchase-transaction-badge :token-id="edition.tokenId" v-if="edition && edition.tokenId"></purchase-transaction-badge>
    </div>

    <hr/>

    <div class="row mt-4" v-if="edition && !edition.tokenId">
      <div class="col-sm-8">
        <price-in-eth :value="edition.priceInEther | to4Dp"></price-in-eth>
        <span class="pl-1"><u-s-d-price :price-in-ether="edition.priceInEther"></u-s-d-price></span>
      </div>
      <div class="col-sm-4 text-right">
        <LikeIconButton :edition-number="edition.edition"></LikeIconButton>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash';

  import { mapGetters, mapState } from 'vuex';
  import ClickableAddress from '../generic/ClickableAddress';
  import Availability from '../v2/Availability';
  import HighResLabel from '../highres/HighResLabel';
  import CreativeChallengeLabel from '../../ui-controls/generic/CreativeChallengeLabel';
  import PriceInEth from '../generic/PriceInEth';
  import MetadataAttributes from '../v2/MetadataAttributes';
  import USDPrice from '../generic/USDPrice';
  import RarityIndicator from '../v2/RarityIndicator';
  import IpfsBadge from '../badges/IpfsBadge';
  import Erc721Badge from '../badges/ERC721Badge';
  import BirthTransactionBadge from '../badges/BirthTransactionBadge';
  import TokenIdBadge from '../badges/TokenIdBadge';
  import XOfXBadge from '../badges/XOfXBadge';
  import PurchaseTransactionBadge from '../badges/PurchaseTransactionBadge';
  import LikeIconButton from '../likes/LikeIconButton';

  export default {
    name: 'edition-card',
    props: ['edition'],
    components: {
      PurchaseTransactionBadge,
      XOfXBadge,
      TokenIdBadge,
      BirthTransactionBadge,
      Erc721Badge,
      IpfsBadge,
      Availability,
      ClickableAddress,
      HighResLabel,
      CreativeChallengeLabel,
      PriceInEth,
      MetadataAttributes,
      USDPrice,
      RarityIndicator,
      LikeIconButton
    },
    computed: {
      ...mapGetters([
        'findArtistsForAddress'
      ]),
      artist () {
        return this.findArtistsForAddress(this.edition.artistAccount) || {};
      },
      artistAddress () {
        const artist = this.artist;
        if (!artist) {
          return {};
        }
        if (_.isArray(artist.ethAddress)) {
          return artist.ethAddress[0];
        }
        return artist.ethAddress;
      },
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card.scss';
</style>
