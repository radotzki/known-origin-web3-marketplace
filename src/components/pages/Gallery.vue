<template>
  <div class="container">
    <h1>Gallery</h1>


    <loading-spinner v-if="!hasFinishedLoading()"></loading-spinner>

    <div class="row justify-content-sm-center" v-if="!hasFinishedLoading()">
      <div class="col text-center mt-5">
        <p>We are loading assets from the Blockchain.</p>
        <p>Please be patient as we are fully decentralised.</p>
      </div>
    </div>

    <div class="form-row mb-4" v-if="hasFinishedLoading()">
      <div class="col">
        <select class="form-control" title="price filter" v-model="priceFilter">
          <option value="asc">Low to high</option>
          <option value="desc">High to low</option>
          <option value="high-res">High-res</option>
          <option value="sold">Sold</option>
          <option value="featured">Featured artwork</option>
        </select>
      </div>
      <div class="col d-none d-md-block">
        <select class="form-control" title="artist filter" v-model="artistFilter">
          <option value="all">Artists...</option>
          <option v-for="{artistCode, name} in orderedArtists" :value="artistCode">{{name}}</option>
        </select>
      </div>
      <div class="col">
        <input type="text" class="form-control" v-model="search" placeholder="Search assets..."/>
      </div>
    </div>

    <h4 class="text-primary pb-4 pt-2" v-if="hasFinishedLoading() && priceFilter === 'featured'">KnownOrigin.io x 0xCert Creative Challenge <br/>for Nifty Conference + Hackathon (July 24-26, 2018)</h4>

    <div class="card-columns" v-if="editions.length > 0">
      <galleryEdition
        v-for="edition in editions"
        :edition="edition"
        :key="edition.edition">
      </galleryEdition>
    </div>

  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import GalleryEdition from '../GalleryEdition';
  import LoadingSpinner from "../ui-controls/LoadingSpinner.vue";
  import _ from 'lodash';

  export default {
    name: 'gallery',
    components: {
      LoadingSpinner,
      GalleryEdition
    },
    data() {
      return {
        finishedLoading: false,
        priceFilter: 'featured',
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
      ]),
      ...mapGetters('assets', [
        'editionSummaryFilter',
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
</style>
