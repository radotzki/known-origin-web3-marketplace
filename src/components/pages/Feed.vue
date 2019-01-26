<template>
  <div>
    <div class="row bg-primary full-banner-secondary pt-3 mt-1 mb-3">
      <div class="col text-center">
        Feed
      </div>
    </div>

    <div class="container-fluid mt-4">
      <loading-section :page="PAGES.FEED"></loading-section>

      <div class="row editions-wrap" v-if="(latest || []).length > 0 && assets">
        <div class="col-12">
          <h5 class="mb-3">
            <span title="New artworks landing on the platform">
              Recently added
            </span>
            <router-link :to="{ name: 'gallery' }" class="btn-link small float-right">
              View all
            </router-link>
          </h5>
          <hr/>
        </div>
        <div class="card-deck">
          <div class="col-sm-3 mb-5"
               v-for="editionNumber in latest" :key="editionNumber"
               v-if="assets[editionNumber] && assets[editionNumber].active">
            <gallery-card :edition="assets[editionNumber]" :edition-number="editionNumber"></gallery-card>
          </div>
        </div>
      </div>

      <div class="row editions-wrap" v-if="assets && Object.keys(assets).length > 0">
        <div class="col-12">
          <h5 class="mb-3">
            <span title="Some of our favourites">
              Community picks
            </span>
            <router-link :to="{ name: 'gallery' }" class="btn-link small float-right">
              View all
            </router-link>
          </h5>
          <hr/>
        </div>
        <div class="card-deck">
          <div class="col-sm-3 mb-5"

               v-for="editionNumber in limitBy(KO_PICKS, 4)" :key="editionNumber"
               v-if="assets[editionNumber] && assets[editionNumber].active">
            <gallery-card :edition="assets[editionNumber]" :edition-number="editionNumber">
            </gallery-card>
          </div>
        </div>
      </div>

      <div class="row editions-wrap" v-if="(trending || []).length > 0 && assets">
        <div class="col-12">
          <h5 class="mb-3">
            <span title="Whats hot on the platform, a selection of recent sales and bids">
              Trending
            </span>
            <router-link :to="{ name: 'activity' }" class="btn-link small float-right">
              View all
            </router-link>
          </h5>
          <hr/>
        </div>
        <div class="card-deck">
          <div class="col-sm-3 mb-5"
               v-for="editionNumber in limitBy(trending, 4)" :key="editionNumber"
               v-if="assets[editionNumber] && assets[editionNumber].active">
            <gallery-card :edition="assets[editionNumber]" :edition-number="editionNumber">
            </gallery-card>
          </div>
        </div>
      </div>

      <div class="row editions-wrap" v-if="(favourites || []).length > 0 && assets">
        <div class="col-12">
          <h5 class="mb-3">
            <span title="Those with the highest number of likes">
            Most liked
            </span>
            <router-link :to="{ name: 'gallery' }" class="btn-link small float-right">
              View all
            </router-link>
          </h5>
          <hr/>
        </div>
        <div class="card-deck">
          <div class="col-sm-3 mb-5"
               v-for="editionNumber in limitBy(favourites, 4)" :key="editionNumber"
               v-if="assets[editionNumber] && assets[editionNumber].active">
            <gallery-card :edition="assets[editionNumber]" :edition-number="editionNumber">
            </gallery-card>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script>
  import _ from 'lodash';
  import {mapGetters, mapState} from 'vuex';
  import ClickableAddress from '../ui-controls/generic/ClickableAddress';
  import * as actions from '../../store/actions';
  import * as mutation from '../../store/mutation';
  import {PAGES} from '../../store/loadingPageState';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import Availability from '../ui-controls/v2/Availability';
  import HighResLabel from '../ui-controls/highres/HighResLabel';
  import GalleryCard from '../ui-controls/cards/GalleryCard';

  const koPicks = _.shuffle([
    10100,
    10300,
    7500,
    22800,
    25800,
    7700,
    6000,
    19400,
    28600,
    20100,
    26600,
    18300,
    24000,
    19000,
    32300,
    30400
  ]);

  export default {
    name: 'feed',
    components: {
      GalleryCard,
      LoadingSection,
      Availability,
      ClickableAddress,
      HighResLabel,
    },
    data() {
      return {
        PAGES,
        latest: [],
        trending: [],
        favourites: [],
        KO_PICKS: koPicks,
      };
    },
    methods: {},
    computed: {
      ...mapState('kodaV2', [
        'assets',
      ])
    },
    created() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.FEED);

      /////////
      // API //
      /////////

      const loadEventData = () => {

        this.$store.state.editionLookupService.latestCreations()
          .then((results) => {
            if (results.success) {
              const {data} = results;
              this.latest = _.uniq(_.map(data, 'edition'));
              this.$store.commit(`kodaV2/${mutation.SET_EDITIONS}`, data);
            }
          })
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.FEED);
          });

        this.$store.state.editionLookupService.trendingEditions()
          .then((results) => {
            console.log(results);
            if (results.success) {
              const {data} = results;
              this.trending = _.uniq(_.map(data, 'edition'));
              this.$store.commit(`kodaV2/${mutation.SET_EDITIONS}`, data);
            }
          })
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.FEED);
          });

        this.$store.state.likesService.loadTopLikedEditions()
          .then((favourites) => {
            const editionsToLoad = _.uniq(favourites);
            this.favourites = editionsToLoad;
            this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, editionsToLoad);
          })
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.FEED);
          });
      };

      this.$store.watch(
        () => this.$store.state.eventService.firebasePath,
        () => loadEventData()
      );

      if (this.$store.state.eventService.firebasePath) {
        loadEventData();
      }

      const loadStaffPicks = () => {
        this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, koPicks)
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.FEED);
          });
      };

      this.$store.watch(
        () => this.$store.state.artists,
        () => loadStaffPicks()
      );

      if (this.$store.state.artists) {
        loadStaffPicks();
      }
    },
    destroyed() {
    }
  };
</script>
<style scoped lang="scss">
  @import '../../ko-colours.scss';
  @import '../../ko-card.scss';
  /* mobile only */
  @media screen and (max-width: 767px) {
    .sub-filter {
      padding-left: 0.7rem;
      padding-right: 0.7rem;
    }
  }
</style>
