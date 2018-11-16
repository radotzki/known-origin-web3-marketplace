<template>
  <div>
    <div class="row bg-secondary text-white full-banner">
      <div class="col text-center m-5">
        <p>Showcase and Discover Rare Digital Art</p>
      </div>
    </div>

    <div class="container-fluid mt-4">
      <div class="row editions-wrap">

        <div class="col-sm-3">
          <artist-panel :artist="lookupArtist()"></artist-panel>
        </div>

        <div class="col-sm-9">

          <loading-section :page="PAGES.ARTISTS"></loading-section>

          <div class="card-deck">
            <div class="col-auto mx-auto mb-5" v-for="edition, editionNumber in editions" :key="editionNumber"
                 v-if="edition.active">
              <gallery-card :edition="edition" :edition-number="editionNumber"></gallery-card>
            </div>
          </div>
        </div>
      </div>

      <accept-edition-bids :editions="editions"></accept-edition-bids>

      <artist-edition-controls :editions="editions"></artist-edition-controls>

    </div>
  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import ArtistPanel from '../ui-controls/artist/ArtistPanel';
  import LoadingSpinner from '../ui-controls/generic/LoadingSpinner';
  import * as actions from '../../store/actions';
  import { PAGES } from '../../store/loadingPageState';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import Availability from '../ui-controls/v2/Availability';
  import _ from 'lodash';
  import AcceptEditionBids from '../ui-controls/auction/AcceptEditionBids';
  import AuctionEventsList from '../ui-controls/auction/AuctionEventsList';
  import GalleryCard from '../ui-controls/cards/GalleryCard';
  import ArtistEditionControls from "../ui-controls/management/ArtistEditionControls";

  export default {
    name: 'artistPage',
    components: {
      ArtistEditionControls,
      GalleryCard,
      AuctionEventsList,
      AcceptEditionBids,
      Availability,
      LoadingSection,
      ArtistPanel,
      LoadingSpinner,
    },
    data () {
      return {
        PAGES: PAGES
      };
    },
    computed: {
      ...mapState([
        'account',
      ]),
      ...mapGetters([
        'findArtistsForAddress',
      ]),
      ...mapGetters('kodaV2', [
        'editionsForArtist',
        'isStartDateInTheFuture'
      ]),
      editions: function () {
        return this.editionsForArtist(this.getArtistAddress());
      }
    },
    methods: {
      canAcceptBid: function (auction) {
        // The owner and the artist can accept bids
        return auction.controller === this.account || this.account === this.owner;
      },
      lookupArtist: function () {
        return this.findArtistsForAddress(this.$route.params.artistAccount);
      },
      goToArtist: function (artistAccount) {
        this.$router.push({name: 'artist-v2', params: {artistAccount}});
      },
      getArtistAddress: function () {
        let artists = this.lookupArtist();
        if (_.isArray(artists.ethAddress)) {
          return artists.ethAddress[0];
        }
        return artists.ethAddress;
      },
      getEdition: function (edition) {
        return this.editions[edition] || {};
      },
      acceptBid: function (auction) {
        this.$store.dispatch(`auction/${actions.ACCEPT_BID}`, auction);
      },
    },
    created () {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ARTISTS);

      const loadData = function () {
        this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS_FOR_ARTIST}`, {artistAccount: this.getArtistAddress()})
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.ARTISTS);
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
    destroyed () {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../ko-colours.scss';
  @import '../../ko-card.scss';

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
</style>
