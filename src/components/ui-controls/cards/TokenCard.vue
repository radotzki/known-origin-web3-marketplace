<template>
  <div class="card shadow-sm">
    <router-link :to="{ name: 'edition-token', params: { tokenId: edition.tokenId }, props: { edition: edition } }" class="card-target">
      <img class="card-img-top" :src="edition.lowResImg" :id="editionNumber"/>

      <div class="high-res">
        <high-res-label :high-res-available="edition.highResAvailable"></high-res-label>
      </div>
      <div class="card-body">
        <p class="card-title">{{ edition.name }}</p>
      </div>
      <div class="card-footer bg-white no-top-border">
        <div class="row">
          <div class="col"><price-in-eth :value="edition.priceInEther"></price-in-eth></div>
          <div class="col text-right">
            <span class="badge badge-primary">{{ edition.tokenId }}</span>
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
  import HighResLabel from '../generic/HighResLabel';
  import PriceInEth from '../generic/PriceInEth';

  export default {
    name: 'token-card',
    props: ['edition', 'editionNumber'],
    components: {
      ClickableAddress,
      HighResLabel,
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

  .no-top-border {
    border-top: 0 none !important;
  }

  @import '../../../ko-card.scss';
</style>
