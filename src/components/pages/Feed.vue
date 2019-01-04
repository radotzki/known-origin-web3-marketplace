<template>
  <div>
    <div class="row bg-primary full-banner-secondary pt-3 mt-1 mb-3">
      <div class="col text-center">
        Feed
      </div>
    </div>

    <div class="container-fluid mt-4">
      <loading-section :page="PAGES.FEED"></loading-section>

      <div class="row editions-wrap" v-if="assets && Object.keys(assets).length > 0">
        <div class="col-12">
          <h5 class="mb-3">
            <span title="Some of our favourites">
              Community picks
            </span>
            <router-link :to="{ name: 'gallery' }" class="small float-right">
              View all
            </router-link>
          </h5>
          <hr/>
        </div>
        <div class="card-deck">
          <div class="col-auto mx-auto mb-5"
               v-for="editionNumber in limitBy(KO_PICKS, 8)" :key="editionNumber"
               v-if="assets[editionNumber] && assets[editionNumber].active">
            <gallery-card :edition="assets[editionNumber]" :edition-number="editionNumber">
            </gallery-card>
          </div>
        </div>
      </div>

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
          <div class="col-auto mx-auto mb-5"
               v-for="editionNumber in limitBy(latest, 8)" :key="editionNumber"
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
          <div class="col-auto mx-auto mb-5"
               v-for="editionNumber in limitBy(trending, 8)" :key="editionNumber"
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
  import {PAGES} from '../../store/loadingPageState';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import Availability from '../ui-controls/v2/Availability';
  import HighResLabel from '../ui-controls/generic/HighResLabel';
  import GalleryCard from '../ui-controls/cards/GalleryCard';

  const koPicks = _.shuffle([
    31800,
    6000,
    32600,
    22000,
    31500,
    28600,
    26700,
    27700,
    12000,
    8200,
    31000,
    9300,
    32300,
    29900,
    30800,
    30500
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

      const loadEventData = () => {
        Promise.all([
          this.$store.state.eventService.loadLatestCreations(),
          this.$store.state.eventService.loadTrendingEditions()
        ]).then(([latest, trending]) => {
          this.trending = trending;
          this.latest = latest;
          this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, _.uniq(this.latest.concat(this.trending)));
        });
      };

      this.$store.watch(
        () => this.$store.state.eventService,
        () => loadEventData()
      );

      if (this.$store.state.eventService) {
        loadEventData();
      }

      const loadStaffPicks = function () {
        this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, koPicks)
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.FEED);
          });
      }.bind(this);

      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        () => loadStaffPicks()
      );

      if (this.$store.state.KnownOriginDigitalAssetV2) {
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
