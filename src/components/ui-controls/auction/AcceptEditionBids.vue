<template>
  <div class="col-12" v-if="listOpenAuctions.length > 0">

    <hr/>

    <p class="h3">
      Ongoing Auctions
    </p>

    <p class="lead">
      Below are list of ongoing auctions which can be actioned by the artists account for each edition.
    </p>

    <hr/>

    <div class="row pb-4" v-for="auction in listOpenAuctions">

      <!-- Edition Image -->
      <div class="col text-center">
        <router-link :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: auction.edition }}">
          <img :src="getEdition(auction.edition).lowResImg" class="img-thumbnail" style="width: 150px;"/>
        </router-link>
      </div>

      <!-- Auction Details -->
      <div class="col">
        <p>
          Edition No.
          <router-link :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: auction.edition }}">
            <strong>{{auction.edition}}</strong>
          </router-link>
        </p>
        <p v-if="auction.highestBid > 0">
          Highest bidder:
          <clickable-address :eth-address="auction.highestBidder"></clickable-address>
        </p>
        <p>
          Artist account:
          <clickable-address :eth-address="auction.controller"></clickable-address>
        </p>
        <p v-if="auction.highestBid > 0">
          <span>Current bid</span>
          <span class="font-weight-bold">
                <price-in-eth :value="auction.highestBid"></price-in-eth>
                <usd-price :price-in-ether="auction.highestBid"></usd-price>
              </span>
        </p>
        <p v-else>
          <strong>No bidders yet!</strong>
        </p>
      </div>

      <!-- Accept Bid Action & Transaction -->
      <div class="col">
        <p v-if="canAcceptBid(auction) && auction.highestBid > 0">
          <button class="btn btn-primary" v-on:click="acceptBid(auction)">Accept Bid</button>
        </p>

        <div v-if="isAcceptingBidTriggered(auction.edition)">
          <div class="card-text mt-4">
            Transaction triggered
            <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
          </div>
          <clickable-transaction
            :transaction="getAcceptingBidTransactionForEdition(auction.edition)"
            :show-label="false">
          </clickable-transaction>
        </div>

        <div v-if="isAcceptingBidStarted(auction.edition)">
          <div class="card-text mt-4">
            Your transaction is being confirmed...
            <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
          </div>
          <clickable-transaction
            :transaction="getAcceptingBidTransactionForEdition(auction.edition)"
            :show-label="false">
          </clickable-transaction>
        </div>

        <div v-if="isAcceptingBidSuccessful(auction.edition)">
          <div class="card-text mt-4">
            Bid confirmed
          </div>
          <clickable-transaction
            :transaction="getAcceptingBidTransactionForEdition(auction.edition)"
            :show-label="false">
          </clickable-transaction>
        </div>

        <div v-if="isAcceptingBidFailed(auction.edition)">
          <span class="card-text text-danger mt-4">Your transaction failed!</span>
          <img src="../../../../static/Failure.svg" style="width: 25px"/>
        </div>
      </div>

    </div>

  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import ArtistShortBio from '../../ui-controls/artist/ArtistShortBio';
  import ArtistPanel from '../../ui-controls/artist/ArtistPanel';
  import LoadingSpinner from '../../ui-controls/generic/LoadingSpinner';
  import * as actions from '../../../store/actions';
  import RarityIndicator from '../../ui-controls/v2/RarityIndicator';
  import MetadataAttributes from '../../ui-controls/v2/MetadataAttributes';
  import TweetEditionButton from '../../ui-controls/v2/TweetEditionButton';
  import HighResLabel from '../../ui-controls/generic/HighResLabel';
  import {PAGES} from '../../../store/loadingPageState';
  import LoadingSection from '../../ui-controls/generic/LoadingSection';
  import ClickableAddress from '../../ui-controls/generic/ClickableAddress';
  import Availability from '../../ui-controls/v2/Availability';
  import _ from 'lodash';
  import EthAddress from "../../ui-controls/generic/EthAddress";
  import PriceInEth from "../../ui-controls/generic/PriceInEth";
  import UsdPrice from "../../ui-controls/generic/USDPrice";
  import ClickableTransaction from "../../ui-controls/generic/ClickableTransaction";
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    name: 'acceptEditionBids',
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
        PAGES: PAGES,
      };
    },
    props: {
      editions: {
        type: Object,
        default: () => {
          return {};
        }
      }
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
      listOpenAuctions: function () {
        const editionNumbers = _.keys(this.editions);
        return _.filter(this.auction, (auction) => {
          if (!auction.enabled) {
            return false;
          }
          return _.indexOf(editionNumbers, auction.edition) > -1;
        });
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
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card.scss';

  .accepting-bid-card {
    /*min-height: 275px;*/
    /*width: 18rem;*/
  }


</style>
