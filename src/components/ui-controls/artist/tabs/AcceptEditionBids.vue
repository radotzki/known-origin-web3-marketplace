<template>
  <div class="container-fluid">

    <h3>Open Offers</h3>
    <p>
      Artists can <strong>accept</strong> or <strong>reject</strong> offers and the highest bidder can
      <strong>withdraw</strong> there offer.
    </p>

    <div class="row">
      <div class="col text-center">
        <font-awesome-icon :icon="['fas', 'spinner']" spin v-if="isLoading"></font-awesome-icon>
      </div>
    </div>

    <lazy-component @show="visibilityChanged">

      <div v-if="listOpenAuctions.length === 0 && !isLoading" class="pb-4">
        <code>No open offers at the moment</code>
      </div>

      <div v-if="listOpenAuctions.length > 0"
           class="pb-4">

        <table class="table">
          <tbody>
          <tr v-for="auction in listOpenAuctions" :key="auction.edition">
            <td>
              <router-link :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: auction.edition }}">
                <edition-image style="max-width: 100px" :src="getEdition(auction.edition).lowResImg"
                               :id="auction.edition"/>
              </router-link>
            </td>
            <td class="d-none d-md-table-cell align-middle">
              <div>
                <span>{{getEdition(auction.edition).name}}</span>
              </div>
              <remaining-count class="small"
                               :totalAvailable="getEdition(auction.edition).totalAvailable"
                               :totalSupply="getEdition(auction.edition).totalSupply">
              </remaining-count>
            </td>
            <td class="align-middle">
              <div v-if="auction.highestBid > 0">
                <price-in-eth :value="auction.highestBid"></price-in-eth>
                <usd-price :price-in-ether="auction.highestBid"></usd-price>
              </div>
            </td>
            <td class="d-none d-md-table-cell align-middle">
              <div>
                <clickable-address :eth-address="auction.highestBidder"></clickable-address>
                <span class="small text-muted">bidder</span>
              </div>
            </td>
            <td class="w-25 align-middle text-center">
              <div v-if="isArtist(auction)" title="Accept the offer">
                <accepting-bid-flow :auction="auction"></accepting-bid-flow>
              </div>
              <div v-if="isBidder(auction)" title="Withdraw the offer">
                <withdrawing-bid-flow :auction="auction"></withdrawing-bid-flow>
              </div>
              <div v-if="isArtist(auction)" title="Reject the offer">
                <reject-bid-flow :auction="auction"></reject-bid-flow>
              </div>
              <div v-if="isKo" title="Close the auction">
                <cancelling-auction-flow :auction="auction"></cancelling-auction-flow>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

    </lazy-component>

  </div>
</template>

<script>

  import _ from 'lodash';
  import * as actions from '../../../../store/actions';
  import {mapGetters, mapState} from 'vuex';
  import {PAGES} from '../../../../store/loadingPageState';
  import ClickableAddress from '../../../ui-controls/generic/ClickableAddress';
  import PriceInEth from '../../../ui-controls/generic/PriceInEth';
  import UsdPrice from '../../../ui-controls/generic/USDPrice';
  import RemainingCount from "../../v2/RemainingCount";
  import EditionImage from "../../generic/EditionImage";
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import AcceptingBidFlow from "../../auction/control-flows/AcceptingBidFlow";
  import WithdrawingBidFlow from "../../auction/control-flows/WithdrawingBidFlow";
  import RejectBidFlow from "../../auction/control-flows/RejectBidFlow";
  import CancellingAuctionFlow from "../../auction/control-flows/CancelAuctionFlow";

  export default {
    name: 'acceptEditionBids',
    components: {
      CancellingAuctionFlow,
      RejectBidFlow,
      WithdrawingBidFlow,
      AcceptingBidFlow,
      EditionImage,
      RemainingCount,
      FontAwesomeIcon,
      UsdPrice,
      PriceInEth,
      ClickableAddress
    },
    data() {
      return {
        PAGES: PAGES,
        isLoading: false
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
        'auction',
      ]),
      ...mapGetters([
        'findArtistsForAddress',
      ]),
      ...mapState('auction', [
        'owner',
      ]),
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
      listOpenAuctions: function () {
        const editionNumbers = _.keys(this.editions);
        return _.filter(this.auction, (auction) => {
          if (!auction.enabled || auction.highestBidWei <= 0) {
            return false;
          }
          return _.indexOf(editionNumbers, auction.edition) > -1;
        });
      },
      isKo() {
        if (!this.account || !this.owner) {
          return false;
        }
        return this.owner === this.account;
      },
    },
    methods: {
      visibilityChanged() {
        this.isLoading = true;
        this.$store.dispatch(`auction/${actions.GET_AUCTION_DETAILS_FOR_ARTIST}`, {artistAccount: this.artistAddress})
          .finally(() => {
            this.isLoading = false;
          });
      },
      isBidder(auction) {
        if (!this.account) {
          return false;
        }
        return auction.highestBidder === this.account;
      },
      isArtist(auction) {
        if (this.isKo) {
          return true;
        }
        if (!this.account || !auction.controller) {
          return false;
        }
        return auction.controller === this.account;
      },
      getEdition: function (edition) {
        return this.editions[edition] || {};
      },
    },
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../../ko-colours.scss';
  @import '../../../../ko-card.scss';

</style>
