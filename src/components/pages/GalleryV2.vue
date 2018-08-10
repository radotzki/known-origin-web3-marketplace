<template>
  <div>
    <div class="row bg-secondary text-white full-banner">
      <div class="col text-center m-5">
        <p>Showcase and Discover Rare Digital Art</p>
      </div>
    </div>
    <div class="row bg-white full-banner-secondary pt-3">
      <div class="col text-center">
        <p>
          <span class="pl-2 pr-2">Featured Artists</span>
          <span class="pl-2 pr-2">Featured Artists</span>
          <span class="pl-2 pr-2">Featured Artists</span>
          <span class="pl-2 pr-2">Featured Artists</span>
        </p>
      </div>
    </div>

    <div class="container-fluid justify-content-sm-center mt-4">

      <loading-spinner v-if="!hasFinishedLoading()"></loading-spinner>

      <div class="row" v-if="!hasFinishedLoading()">
        <div class="col text-center mt-5">
          <p>We are loading assets from the Blockchain.</p>
          <p>Please be patient as we are fully decentralised.</p>
        </div>
      </div>

      <h4 class="text-primary pb-4 pt-2" v-if="hasFinishedLoading() && priceFilter === 'featured'">KnownOrigin.io x 0xCert Creative Challenge <br/>for Nifty Conference + Hackathon (July 24-26, 2018)
      </h4>

      <div class="row" v-if="editions.length > 0">
        <div class="card-deck">
          <div class="col mx-auto mb-4" v-for="edition in editions">
            <div class="card shadow-sm">
              <img class="card-img-top" :src="edition.lowResImg"/>
              <div class="card-body">
                <p class="card-title">{{ edition.otherMeta.artworkName }}</p>
                <img :src="findArtist(edition.artistCode).img" class="artist-avatar"/>
                <span class="pl-1 artist-name">{{ edition.otherMeta.artist }}</span>
              </div>
              <div class="card-footer">
                <div class="row">
                  <div class="col" v-if="availableAssetsForEdition(edition.edition)">
                    {{ availableAssetsForEdition(edition.edition).length }} available
                  </div>
                  <div class="col text-right">{{ edition.priceInEther }} ETH</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import GalleryEdition from '../GalleryEdition';
  import LoadingSpinner from '../ui-controls/LoadingSpinner.vue';
  import _ from 'lodash';
  import Available from '../ui-controls/Available.vue';

  export default {
    name: 'gallery',
    components: {
      LoadingSpinner,
      GalleryEdition,
      Available
    },
    data () {
      return {
        finishedLoading: false,
        priceFilter: 'asc',
        artistFilter: 'all',
        search: ''
      };
    },
    methods: {
      onSoldToggleChanged: function ({value}) {
        this.showSold = value;
      },
      hasFinishedLoading: function () {
        // Use the lack of assets in the store to determine initial loading state
        if (!this.assets || this.assets.length === 0) {
          return false;
        }
        return this.editions.length > 0 || this.finishedLoading === true;
      },
    },
    computed: {
      ...mapState([
        'artists',
      ]),
      ...mapState('assets', [
        'assets',
        'editionSummary',
      ]),
      ...mapGetters([
        'liveArtists',
        'findArtist'
      ]),
      ...mapGetters('assets', [
        'editionSummaryFilter',
        'availableAssetsForEdition'
      ]),
      orderedArtists: function () {
        return _.orderBy(this.liveArtists, 'name');
      },
      editions: function () {
        this.finishedLoading = false;

        let results = this.editionSummaryFilter(this.priceFilter, this.artistFilter)
          .filter(function (item) {

            if (this.search.length === 0) {
              return true;
            }

            const searchString = this.search.toLowerCase();

            let matchesName = item.artworkName.toLowerCase().indexOf(searchString) >= 0;
            let matchesDescription = item.description.toLowerCase().indexOf(searchString) >= 0;
            let matchesArtist = item.otherMeta.artist.toLowerCase().indexOf(searchString) >= 0;
            let matchesTokenId = `${item.id}`.indexOf(searchString) >= 0;
            let matchesEdition = item.edition.toLowerCase().indexOf(searchString) >= 0;

            return matchesName || matchesDescription || matchesArtist || matchesTokenId || matchesEdition;
          }.bind(this));
        this.finishedLoading = true;
        return results;
      }
    }
  };
</script>

<style scoped lang="scss">
  .full-banner-secondary {

  }

  .card-img-top {
    object-fit: cover;
    height: 12rem;
  }

  .card {
    width: 14rem;
    height: 21.5rem;
  }

  .card-title {
    font-size: 0.9rem;
  }

  .card-body {
    padding: 1rem;
  }

  .card-footer {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    .card-img-top {
      object-fit: cover;
      height: 15rem;
    }

    .card {
      width: 20rem;
      height: 25rem;
    }

    .full-banner {
      font-size: 1.5rem;
    }
  }

  .artist-name {
    font-size: 0.65rem;
  }

  .artist-avatar {
    max-width: 30px;
  }
</style>
