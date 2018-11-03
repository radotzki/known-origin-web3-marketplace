<template>
  <div class="card shadow-sm">
    <router-link class="card-target"
                 :to="{ name: 'confirmPurchase', params: { artistAccount: edition.artistAccount, editionNumber: edition.edition }}">
      <img class="card-img-top" :src="edition.lowResImg" :id="editionNumber"/>
      <div class="high-res">
        <high-res-label :high-res-available="edition.highResAvailable"></high-res-label>
      </div>
      <div class="card-body">
        <p class="card-title"><creative-challenge-label :attributes="edition.attributes"></creative-challenge-label> {{ edition.name }}</p>
      </div>
      <div class="card-footer bg-white no-top-border">
        <div class="row">
          <div class="col"><price-in-eth :value="edition.priceInEther"></price-in-eth></div>
          <div class="col text-right">
            <availability :total-available="edition.totalAvailable" :total-supply="edition.totalSupply"></availability>
          </div>
        </div>
      </div>
    </router-link>

    <router-link :to="{ name: 'artist-v2', params: { artistAccount: edition.artistAccount } }" class="floating-artist-link">
      <div class="card-footer bg-white no-top-border">
        <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
        <a class="pl-1 artist-name">{{ findArtistsForAddress(edition.artistAccount).name | truncate(18) }}</a>
      </div>
    </router-link>
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
