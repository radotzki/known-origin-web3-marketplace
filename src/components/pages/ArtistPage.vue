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
                    <span class="pl-1 artist-name" v-on:click="goToArtist(edition.artistAccount)">{{ findArtistsForAddress(edition.artistAccount).name }}</span>

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

    <div class="row editions-wrap" v-if="listOpenAuctions.length > 0">
      <div class="col-12">

        <hr/>

        <p class="h3">
          Ongoing Auctions
        </p>

        <p class="lead">
          Below are list of ongoing auctions which can be actioned by the artists account for each edition.
        </p>

        <div class="row pb-4" v-for="auction in listOpenAuctions">
          <div class="col-2 text-center">
            <router-link :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: auction.edition }}">
              <img :src="getEdition(auction.edition).lowResImg" class="img-thumbnail" style="width: 150px;"/>
            </router-link>
          </div>
          <div class="col-3">
            <p>
              Edition No.
              <router-link :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: auction.edition }}">
                <strong>{{auction.edition}}</strong>
              </router-link>
            </p>
            <p>
              Highest bidder:
              <clickable-address :eth-address="auction.highestBidder"></clickable-address>
            </p>
            <p>
              Artist account:
              <clickable-address :eth-address="auction.controller"></clickable-address>
            </p>
            <p>
              <span>Current bid</span>
              <span class="font-weight-bold">
                <price-in-eth :value="auction.highestBid"></price-in-eth>
                <usd-price :price-in-ether="auction.highestBid"></usd-price>
              </span>
            </p>
          </div>
          <div class="col-7">
            <p v-if="canAcceptBid(auction) && auction.highestBid > 0">
              <button class="btn btn-primary" v-on:click="acceptBid(auction)">Accept Bid</button>
            </p>

            <div v-if="isAcceptingBidTriggered(auction.edition)">
              Transaction triggered
              <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
              <clickable-transaction :transaction="getAcceptingBidTransactionForEdition(auction.edition)">
              </clickable-transaction>
            </div>

            <div v-if="isAcceptingBidStarted(auction.edition)">
               <span class="card-text mt-4">
                 Your transaction is being confirmed...
                 <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
               </span>
              <clickable-transaction :transaction="getAcceptingBidTransactionForEdition(auction.edition)">
              </clickable-transaction>
            </div>

            <div v-if="isAcceptingBidSuccessful(auction.edition)">
              Bid confirmed
              <clickable-transaction :transaction="getAcceptingBidTransactionForEdition(auction.edition)">
              </clickable-transaction>
            </div>

            <div v-if="isAcceptingBidFailed(auction.edition)">
              <span class="card-text text-danger mt-4">Your transaction failed!</span>
              <img src="../../../static/Failure.svg" style="width: 25px"/>
            </div>
          </div>

        </div>

      </div>
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

  export default {
    name: 'artistPage',
    components: {
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
      ...mapState('auction', [
        'owner',
        'auction',
      ]),
      ...mapGetters('auction', [
        'isAcceptingBidTriggered',
        'isAcceptingBidStarted',
        'isAcceptingBidSuccessful',
        'isAcceptingBidFailed',
        'getAcceptingBidTransactionForEdition',
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
      },
      listOpenAuctions: function () {
        return _.filter(this.auction, {enabled: true});
      },
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
