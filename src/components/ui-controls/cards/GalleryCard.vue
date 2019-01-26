<template>
  <div class="card shadow-sm" :id="'gallery_card_' + edition.edition">

    <router-link :to="routeData()" class="card-target" v-if="edition">
      <edition-image class="card-img-top" :src="edition.lowResImg" :id="edition.edition"/>
    </router-link>

    <div class="high-res">
      <high-res-label :high-res-available="edition.highResAvailable"></high-res-label>
    </div>

    <div class="card-body">
      <div class="row">
        <div class="col-12">
          <router-link :to="routeData()" class="card-target" v-if="edition">
            <p class="card-title mt-2">
              <creative-challenge-label :attributes="edition.attributes"></creative-challenge-label>
              {{ edition.name }}
            </p>
          </router-link>
        </div>
      </div>
    </div>
    <div class="card-footer bg-white no-top-border">
      <div class="row mb-2" v-if="edition && !edition.tokenId">
        <div class="col">
          <router-link :to="routeData()" class="card-target" v-if="edition">
            <p class="card-text">
              <price-in-eth :value="edition.priceInEther | to4Dp"></price-in-eth>
            </p>
          </router-link>
        </div>
        <div class="col text-right">
          <p class="card-text">
            <router-link :to="routeData()" class="card-target" v-if="edition">
              <availability :total-available="edition.totalAvailable" :total-supply="edition.totalSupply"></availability>
            </router-link>
          </p>
        </div>
      </div>
      <div class="row mb-2" v-if="edition && edition.tokenId">
        <div class="col">
          <token-id-badge :token-id="edition.tokenId"></token-id-badge>
        </div>
        <div class="col text-right">
          <x-of-x-badge :edition="edition"></x-of-x-badge>
        </div>
      </div>
      <div class="row">
        <div class="col-8">
          <router-link :to="{ name: 'artist', params: { artistAccount: edition.artistAccount } }" class="floating-artist-link">
            <img class="artist-avatar" alt="artist-logo"
                 :src="(findArtistsForAddress(edition.artistAccount) || {}).logo" :id="edition.artistAccount + edition.edition"/>
            <a class="pl-1 artist-name">{{ (findArtistsForAddress(edition.artistAccount) || {}).name | truncate(15) }}</a>
          </router-link>
        </div>
        <div class="col-4 text-right">
          <LikeIconButton :edition-number="edition.edition"></LikeIconButton>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import ClickableAddress from '../generic/ClickableAddress';
  import Availability from '../v2/Availability';
  import HighResLabel from '../highres/HighResLabel';
  import CreativeChallengeLabel from '../../ui-controls/generic/CreativeChallengeLabel';
  import PriceInEth from '../generic/PriceInEth';
  import LikeIconButton from '../likes/LikeIconButton';
  import EditionImage from '../generic/EditionImage';
  import TokenIdBadge from '../badges/TokenIdBadge';
  import XOfXBadge from '../badges/XOfXBadge';

  export default {
    name: 'gallery-card',
    props: ['edition', 'editionNumber'],
    components: {
      LikeIconButton,
      XOfXBadge,
      TokenIdBadge,
      EditionImage,
      Availability,
      ClickableAddress,
      HighResLabel,
      CreativeChallengeLabel,
      PriceInEth,
    },
    computed: {
      ...mapGetters([
        'findArtistsForAddress'
      ])
    },
    methods: {
      routeData: function () {
        if (this.edition) {
          if (this.edition.tokenId) {
            return {name: 'edition-token', params: {tokenId: this.edition.tokenId}, props: {edition: this.edition}};
          }

          return {name: 'confirmPurchase', params: {artistAccount: this.edition.artistAccount, editionNumber: this.edition.edition}};
        }
        return {};
      }
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';

  .floating-artist-link a {
    color: $secondary;
  }

  .high-res {
    position: absolute;
    top: -5px;
    opacity: 0.9;
  }

  @import '../../../ko-card.scss';
</style>
