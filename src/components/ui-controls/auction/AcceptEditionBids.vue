<template>
  <div class="col" v-if="listOpenAuctions.length > 0">

    <h3>Ongoing auctions</h3>

    <p>
      Below are list of ongoing auctions which can be actioned by the artists account for each edition.
    </p>

    <div class="card-deck">
      <div class="col-auto mx-auto mb-5" v-for="auction in listOpenAuctions" :key="auction.edition">
        <div class="card shadow-sm">
          <router-link :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: auction.edition }}">
            <img :src="getEdition(auction.edition).lowResImg" class="card-img-top"/>
            <div class="accepts-bid">
              <span class="badge badge-secondary">auction</span>
            </div>
          </router-link>
          <div class="card-body">
            <p class="card-title">
              {{getEdition(auction.edition).name}}
            </p>

            <p v-if="auction.highestBid > 0" class="card-text">
              Bid:
              <span class="float-right">
                <price-in-eth :value="auction.highestBid"></price-in-eth>
                <usd-price :price-in-ether="auction.highestBid"></usd-price>
                <br/>
                <clickable-address :eth-address="auction.highestBidder" class="float-right small"></clickable-address>
              </span>
            </p>
            <p v-else class="card-text text-center text-primary">
              No bids yet...
            </p>
          </div>
          <div class="card-footer" v-if="auction.highestBid > 0">
            <button v-if="canAcceptBid(auction)" class="btn btn-primary btn-sm" v-on:click="acceptBid(auction)">Accept Bid</button>

            <div v-if="isAcceptingBidTriggered(auction.edition)">
              <div class="card-text mt-4">
                Transaction triggered
                <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
              </div>
              <clickable-transaction :transaction="getAcceptingBidTransactionForEdition(auction.edition)">
              </clickable-transaction>
            </div>

            <div v-if="isAcceptingBidStarted(auction.edition)">
              <div class="card-text mt-4">
                Your transaction is being confirmed...
                <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
              </div>
              <clickable-transaction :transaction="getAcceptingBidTransactionForEdition(auction.edition)">
              </clickable-transaction>
            </div>

            <div v-if="isAcceptingBidSuccessful(auction.edition)">
              <div class="card-text mt-4">
                Bid confirmed
              </div>
              <clickable-transaction :transaction="getAcceptingBidTransactionForEdition(auction.edition)"></clickable-transaction>
            </div>

            <div v-if="isAcceptingBidFailed(auction.edition)">
              <span class="card-text text-danger mt-4">Your transaction failed!</span>
              <img src="../../../../static/Failure.svg" style="width: 25px"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import ArtistShortBio from '../../ui-controls/artist/ArtistShortBio';
  import ArtistPanel from '../../ui-controls/artist/ArtistPanel';
  import LoadingSpinner from '../../ui-controls/generic/LoadingSpinner';
  import * as actions from '../../../store/actions';
  import RarityIndicator from '../../ui-controls/v2/RarityIndicator';
  import MetadataAttributes from '../../ui-controls/v2/MetadataAttributes';
  import TweetEditionButton from '../../ui-controls/v2/TweetEditionButton';
  import HighResLabel from '../../ui-controls/generic/HighResLabel';
  import { PAGES } from '../../../store/loadingPageState';
  import LoadingSection from '../../ui-controls/generic/LoadingSection';
  import ClickableAddress from '../../ui-controls/generic/ClickableAddress';
  import Availability from '../../ui-controls/v2/Availability';
  import _ from 'lodash';
  import EthAddress from '../../ui-controls/generic/EthAddress';
  import PriceInEth from '../../ui-controls/generic/PriceInEth';
  import UsdPrice from '../../ui-controls/generic/USDPrice';
  import ClickableTransaction from '../../ui-controls/generic/ClickableTransaction';
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
    data () {
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
    destroyed () {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card.scss';

  .accepts-bid {
    position: absolute;
    top: -4px;
    opacity: 0.9;
  }


</style>
