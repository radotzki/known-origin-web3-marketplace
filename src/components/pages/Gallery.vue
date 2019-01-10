<template>
  <div>
    <div class="row bg-primary full-banner-secondary pt-3 mt-1">
      <div class="col text-center">
        <p>
          <span @click="onSubFilter('asc')"
                class="sub-filter"
                v-bind:class="{'font-weight-bold': priceFilter === 'asc'}">Low - High</span>
          <span @click="onSubFilter('desc')"
                class="sub-filter d-md-inline"
                v-bind:class="{'font-weight-bold': priceFilter === 'desc'}">High - Low</span>
        </p>
      </div>
    </div>

    <div class="container-fluid mt-4">

      <loading-section :page="PAGES.GALLERY"></loading-section>

      <div class="row editions-wrap">
        <div class="card-deck">
          <div class="col-auto mx-auto mb-5"
               v-for="edition, editionNumber in limitBy(editions, currentList)" :key="editionNumber"
               v-if="edition.active">
            <gallery-card :edition="edition" :edition-number="editionNumber"></gallery-card>
          </div>
        </div>
      </div>

      <div class="row editions-wrap pt-1 pb-4" v-if="canShowMore">
        <div class="col-12 text-center">
          <button @click="showMore" class="btn btn-block btn-outline-primary">Show more</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

  import _ from 'lodash';
  import {mapGetters, mapState} from 'vuex';
  import ArtistPanel from '../ui-controls/artist/ArtistPanel';
  import ClickableAddress from '../ui-controls/generic/ClickableAddress';
  import * as actions from '../../store/actions';
  import {PAGES} from '../../store/loadingPageState';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import Availability from '../ui-controls/v2/Availability';
  import HighResLabel from '../ui-controls/highres/HighResLabel';
  import GalleryCard from '../ui-controls/cards/GalleryCard';

  export default {
    name: 'galleryKODAV2',
    components: {
      GalleryCard,
      LoadingSection,
      Availability,
      ClickableAddress,
      ArtistPanel,
      HighResLabel
    },
    data() {
      return {
        PAGES,
        priceFilter: 'asc',
        currentList: 20
      };
    },
    methods: {
      onSubFilter: function (value) {
        this.priceFilter = value;
      },
      goToArtist: function (artistAccount) {
        this.$router.push({name: 'artist', params: {artistAccount}});
      },
      showMore: function () {
        this.currentList = this.currentList + 20;
      },
    },
    computed: {
      ...mapGetters('kodaV2', [
        'filterEditions',
      ]),
      editions: function () {
        return this.filterEditions(this.priceFilter);
      },
      canShowMore: function () {
        const totalAvailable = _.size(this.editions);
        if (totalAvailable === 0) {
          return false;
        }
        return totalAvailable > this.currentList;
      }
    },
    created() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.GALLERY);

      const loadData = function () {
        this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS_FOR_TYPE}`, {editionType: 1})
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.GALLERY);
          });
      }.bind(this);

      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        () => loadData()
      );

      if (this.$store.state.KnownOriginDigitalAssetV2) {
        loadData();
      }
    },
    destroyed() {
    }
  };
</script>


<style scoped lang="scss">
  @import '../../ko-colours.scss';
  @import '../../ko-card.scss';

  .full-banner {
    p {
      margin-bottom: 0;
    }
  }

  .sub-filter {
    cursor: pointer;
    padding-left: 3rem;
    padding-right: 3rem;
    color: $body-bg;
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    .full-banner {
      font-size: 1.5rem;
    }

    .sub-filter {
      padding-left: 0.7rem;
      padding-right: 0.7rem;
    }
  }

  @import '../../ko-card.scss';
</style>
