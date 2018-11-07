<template>
  <div class="card shadow-sm">

    <router-link :to="routeData()" class="card-target" v-if="edition">
      <img class="card-img-top" :src="edition.lowResImg" :id="editionNumber"/>
    </router-link>

    <div class="high-res">
      <high-res-label :high-res-available="edition.highResAvailable"></high-res-label>
    </div>
    <div class="card-body">
      <router-link :to="routeData()" class="card-target" v-if="edition">
        <p class="card-title mt-2">
          <creative-challenge-label :attributes="edition.attributes"></creative-challenge-label>
          {{ edition.name }}
          <span class="badge badge-primary float-right" v-if="edition && edition.tokenId">{{ edition.tokenId }}</span>
        </p>
      </router-link>
    </div>
    <div class="card-footer bg-white no-top-border">
      <div class="row mb-2" v-if="edition && !edition.tokenId">
        <div class="col">
          <p class="card-text">
            <router-link :to="routeData()" class="card-target" v-if="edition">
              <price-in-eth :value="edition.priceInEther | to2Dp"></price-in-eth>
            </router-link>
          </p>
        </div>
        <div class="col text-right">
          <p class="card-text">
            <router-link :to="routeData()" class="card-target" v-if="edition">
              <availability :total-available="edition.totalAvailable" :total-supply="edition.totalSupply"></availability>
            </router-link>
          </p>
        </div>
      </div>
      <router-link :to="{ name: 'artist-v2', params: { artistAccount: edition.artistAccount } }" class="floating-artist-link">
        <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
        <a class="pl-1 artist-name">{{ findArtistsForAddress(edition.artistAccount).name | truncate(18) }}</a>
      </router-link>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import ClickableAddress from '../generic/ClickableAddress';
  import Availability from '../v2/Availability';
  import HighResLabel from '../generic/HighResLabel';
  import CreativeChallengeLabel from '../../ui-controls/generic/CreativeChallengeLabel';
  import PriceInEth from '../generic/PriceInEth';

  export default {
    name: 'gallery-card',
    props: ['edition', 'editionNumber'],
    components: {
      Availability,
      ClickableAddress,
      HighResLabel,
      CreativeChallengeLabel,
      PriceInEth
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
    top: -4px;
    opacity: 0.9;
  }

  @import '../../../ko-card.scss';
</style>
