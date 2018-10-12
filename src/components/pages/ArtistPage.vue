<template>
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
            <div class="card-target">
              <router-link class="card-target"
                           :to="{ name: 'confirmPurchase', params: { artistAccount: edition.artistAccount, editionNumber: edition.edition }}">
                <div class="card shadow-sm">
                  <img class="card-img-top" :src="edition.lowResImg" :id="editionNumber"/>
                  <div class="card-body">
                    <p class="card-title">{{ edition.name }}</p>
                    <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
                    <span class="pl-1 artist-name" v-on:click="goToArtist(edition.artistAccount)">{{ findArtistsForAddress(edition.artistAccount).name | truncate(18)}}</span>

                    <small class="text-danger" v-if="isStartDateInTheFuture(edition)">
                      <span>Available {{ edition.startDate | moment('from') }}</span>
                    </small>

                  </div>
                  <div class="card-footer">
                    <div class="row">
                      <div class="col">
                        <availability :total-available="edition.totalAvailable"
                                      :total-supply="edition.totalSupply"></availability>
                      </div>
                      <div class="col text-right">{{ edition.priceInEther }} ETH</div>
                    </div>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row editions-wrap">
      <accept-edition-bids :editions="editions"></accept-edition-bids>
    </div>

  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import ArtistShortBio from '../ui-controls/artist/ArtistShortBio';
  import ArtistPanel from '../ui-controls/artist/ArtistPanel';
  import LoadingSpinner from '../ui-controls/generic/LoadingSpinner';
  import * as actions from '../../store/actions';
  import RarityIndicator from '../ui-controls/v2/RarityIndicator';
  import MetadataAttributes from '../ui-controls/v2/MetadataAttributes';
  import TweetEditionButton from '../ui-controls/v2/TweetEditionButton';
  import HighResLabel from '../ui-controls/generic/HighResLabel';
  import {PAGES} from '../../store/loadingPageState';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import ClickableAddress from '../ui-controls/generic/ClickableAddress';
  import Availability from '../ui-controls/v2/Availability';
  import _ from 'lodash';
  import EthAddress from "../ui-controls/generic/EthAddress";
  import PriceInEth from "../ui-controls/generic/PriceInEth";
  import UsdPrice from "../ui-controls/generic/USDPrice";
  import ClickableTransaction from "../ui-controls/generic/ClickableTransaction";
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import AcceptEditionBids from "../ui-controls/auction/AcceptEditionBids";

  export default {
    name: 'artistPage',
    components: {
      AcceptEditionBids,
      FontAwesomeIcon,
      ClickableTransaction,
      UsdPrice,
      PriceInEth,
      EthAddress,
      Availability,
      LoadingSection,
      HighResLabel,
      TweetEditionButton,
      MetadataAttributes,
      RarityIndicator,
      ArtistShortBio,
      ArtistPanel,
      LoadingSpinner,
      ClickableAddress
    },
    data() {
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
    created() {
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
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../ko-colours.scss';
  @import '../../ko-card.scss';
</style>
