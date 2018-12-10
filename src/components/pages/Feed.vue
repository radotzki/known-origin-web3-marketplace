<template>
  <div>
    <div class="row bg-primary full-banner-secondary pt-3 mt-1 mb-3">
      <div class="col text-center">
        Feed
      </div>
    </div>

    <div class="container-fluid">
      <loading-section :page="PAGES.FEED"></loading-section>

      <div class="row editions-wrap">
        <div class="col-12">
          <h5 class="mb-3">
            Staff picks <small class="text-muted">some of our favourites</small>
            <router-link :to="{ name: 'gallery' }" class="btn-link small float-right">
              View all
            </router-link>
          </h5>
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
            Recently added <small class="text-muted">new artworks landing on the platform</small>
            <router-link :to="{ name: 'gallery' }" class="btn-link small float-right">
              View all
            </router-link>
          </h5>
        </div>
        <div class="card-deck">
          <div class="col-auto mx-auto mb-5"
               v-for="editionNumber in limitBy(latest, 12)" :key="editionNumber"
               v-if="assets[editionNumber] && assets[editionNumber].active">
            <gallery-card :edition="assets[editionNumber]" :edition-number="editionNumber">
            </gallery-card>
          </div>
        </div>
      </div>

      <div class="row editions-wrap" v-if="(trending || []).length > 0 && assets">
        <div class="col-12">
          <h5 class="mb-3">
            Trending <small class="text-muted">whats hot on the platform, a selection of recent sales and bids</small>
            <router-link :to="{ name: 'activity' }" class="btn-link small float-right">
              View all
            </router-link>
          </h5>
        </div>
        <div class="card-deck">
          <div class="col-auto mx-auto mb-5"
               v-for="editionNumber in limitBy(trending, 12)" :key="editionNumber"
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
  import ArtistPanel from '../ui-controls/artist/ArtistPanel';
  import ClickableAddress from '../ui-controls/generic/ClickableAddress';
  import * as actions from '../../store/actions';
  import {PAGES} from '../../store/loadingPageState';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import Availability from '../ui-controls/v2/Availability';
  import HighResLabel from '../ui-controls/generic/HighResLabel';
  import GalleryCard from '../ui-controls/cards/GalleryCard';
  import SimpleArtistPanel from '../ui-controls/artist/SimpleArtistPanel';

  const koPicks = _.shuffle([
    7900,
    20700,
    21700,
    22000,
    7500,
    18600,
    25800,
    20100,
    26300,
    19000,
    27000,
    19300,
    22300,
    27700
  ]);

  export default {
    name: 'feed',
    components: {
      GalleryCard,
      LoadingSection,
      Availability,
      ClickableAddress,
      ArtistPanel,
      HighResLabel,
      SimpleArtistPanel
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
      ]),
      ...mapGetters([
        'liveArtists',
      ]),
    },
    created() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.FEED);

      const loadLatest = () => {
        this.$store.state.firestore
          .collection('raw')
          .doc(this.$store.state.firebasePath)
          .collection('koda-v2')
          .where('event', '==', 'EditionCreated')
          .orderBy('blockNumber', 'desc')
          .limit(15)
          .get()
          .then((querySet) => {
            const editionNumbers = new Set();
            querySet.forEach((doc) => {
              editionNumbers.add(doc.data()._args._editionNumber);
            });
            this.latest = Array.from(editionNumbers);
            console.log(`Loaded latest ediitons of [${this.latest}]`);
          })
          .finally(() => {
            this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, this.latest);
          });
      };

      const loadTrending = () => {
        const rootReference = this.$store.state.firestore
          .collection('raw')
          .doc(this.$store.state.firebasePath);

        const auctionRef = rootReference.collection('auction-v1');
        const kodaRef = rootReference.collection('koda-v2');

        Promise.all([
          kodaRef.where('event', '==', 'Purchase').orderBy('blockNumber', 'desc').limit(30).get(),
          auctionRef.where('event', '==', 'BidPlaced').orderBy('blockNumber', 'desc').limit(10).get(),
        ])
          .then((querySet) => {
            const editionNumbers = new Set();
            _.forEach(querySet, (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                editionNumbers.add(doc.data()._args._editionNumber);
              });
            });
            this.trending = Array.from(editionNumbers);
            console.log(`Loaded trending of [${this.trending}]`);
          })
          .finally(() => {
            this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, this.trending);
          });
      };

      this.$store.watch(
        () => this.$store.state.firebasePath,
        () => {
          loadLatest();
          loadTrending();
        }
      );

      if (this.$store.state.firebasePath) {
        loadLatest();
        loadTrending();
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
