<template>
  <div>
    <div class="row bg-primary full-banner-secondary pt-3 mt-1">
      <div class="col text-center">
        Artist
      </div>
    </div>

    <loading-section :page="PAGES.ARTISTS"></loading-section>

    <div class="container-fluid mt-4">
      <div class="row editions-wrap">

        <div class="col-sm-3">
          <artist-panel :artist="artist"></artist-panel>
        </div>

        <div class="col-sm-9">

          <!-- ARTWORKS -->
          <b-tabs>

            <b-tab title="Artworks" class="mt-2" active>
              <div class="card-deck">
                <div class="col-sm-4 mb-5"
                     v-for="edition in editions" :key="edition.edition"
                     v-if="edition.active">
                  <gallery-card :edition="edition" :edition-number="edition.edition"></gallery-card>
                </div>
              </div>
            </b-tab>

            <!-- OFFERS/BIDS -->
            <b-tab title="Offers">
              <accept-edition-bids class="mt-2" :editions="editions"></accept-edition-bids>
            </b-tab>

            <!-- SALES -->
            <b-tab title="Sales">
              <edition-sales-events class="mt-2" :editions="editions"></edition-sales-events>
            </b-tab>

            <!-- ARTWORKS CONTROLS -->
            <b-tab title="Pricing" v-if="shouldShowArtistTabs">
              <artist-edition-controls class="mt-2" :editions="editions"></artist-edition-controls>
            </b-tab>

            <!-- ARTISTS CONTROLS -->
            <b-tab title="Profile" title-item-class="d-none d-md-block" v-if="shouldShowArtistTabs">
              <artist-data-control-panel :editions="editions" :artist="artist"></artist-data-control-panel>
            </b-tab>

            <!-- SELF SERVICE -->
            <b-tab title="Creation" v-if="shouldShowSelfServiceTabs">
              <self-service :artist="artist"></self-service>
            </b-tab>

            <!-- SELF SERVICE -->
            <b-tab title="Downloads" v-if="shouldShowSelfServiceTabs">
              <add-high-res :artist="artist"></add-high-res>
            </b-tab>

          </b-tabs>
        </div>

      </div>
    </div>
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import ArtistPanel from '../ui-controls/artist/ArtistPanel';
  import LoadingSpinner from '../ui-controls/generic/LoadingSpinner';
  import * as actions from '../../store/actions';
  import {PAGES} from '../../store/loadingPageState';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import Availability from '../ui-controls/v2/Availability';
  import _ from 'lodash';
  import AcceptEditionBids from '../ui-controls/artist/tabs/AcceptEditionBids';
  import AuctionEventsList from '../ui-controls/auction/AuctionEventsList';
  import GalleryCard from '../ui-controls/cards/GalleryCard';
  import ArtistEditionControls from "../ui-controls/artist/tabs/ArtistEditionControls";
  import ArtistDataControlPanel from "../ui-controls/artist/tabs/ArtistDataControlPanel";
  import EditionSalesEvents from "../ui-controls/artist/tabs/EditionSalesEvents";
  import SelfService from "../ui-controls/artist/tabs/SelfService";
  import AddHighRes from "../ui-controls/artist/tabs/AddHighRes";

  export default {
    name: 'artistPage',
    metaInfo() {
      return {
        title: `${this.artist.name} - ${this.artist.shortDescription}`
      };
    },
    components: {
      AddHighRes,
      SelfService,
      EditionSalesEvents,
      ArtistDataControlPanel,
      ArtistEditionControls,
      GalleryCard,
      AuctionEventsList,
      AcceptEditionBids,
      Availability,
      LoadingSection,
      ArtistPanel,
      LoadingSpinner,
    },
    data() {
      return {
        PAGES: PAGES,
          canCreateAnotherEdition: false
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
      ...mapState('artistControls', [
        'owner',
        'paused',
      ]),
      ...mapState('selfService', {
        'selfServiceOwner': 'owner',
        'selfServicePaused': 'paused',
      }),
      editions() {
        return this.editionsForArtist(this.artist.ethAddress);
      },
      artist() {
        return this.findArtistsForAddress(this.$route.params.artistAccount);
      },
      artistAddress() {
        const artist = this.artist;
        if (!artist) {
          return {};
        }
        if (_.isArray(artist.ethAddress)) {
          return artist.ethAddress[0];
        }
        return artist.ethAddress;
      },
      shouldShowArtistTabs() {
        return this.account && !this.paused && this.isArtistViewingPage;
      },
      shouldShowSelfServiceTabs() {
        return this.account && !this.selfServicePaused && this.isArtistViewingPage;
      },
      isArtistViewingPage() {
        // If logged in account is the smart contract owner
        if (this.account === this.owner || this.account === this.selfServiceOwner) {
          return true;
        }
        return this.artistAddress === this.account && this.canCreateAnotherEdition;
      }
    },
    created() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ARTISTS);

      const loadApiData = () => {
        this.$store.dispatch(actions.LOAD_ARTISTS)
          .then(() => {
            return this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS_FOR_ARTIST}`, {artistAccount: this.artistAddress});
          })
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.ARTISTS);

            this.$store.dispatch(`selfService/${actions.GET_SELF_SERVICE_ENABLED_FOR_ACCOUNT}`, {artistAccount: this.artistAddress})
              .then(({canCreateAnotherEdition}) => {
                console.log(`Account canCreateAnotherEdition`, canCreateAnotherEdition);
                this.canCreateAnotherEdition = canCreateAnotherEdition;
              });
          });
      };

      this.$store.watch(
        () => this.$store.state.editionLookupService.currentNetworkId,
        () => loadApiData()
      );

      if (this.$store.state.editionLookupService.currentNetworkId) {
        loadApiData();
      }

    },
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../ko-colours.scss';
  @import '../../ko-card.scss';
</style>
