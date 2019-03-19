<template>
  <div>
    <div class="row bg-primary full-banner-secondary pt-3 mt-1">
      <div class="col text-center">
        Offers
      </div>
    </div>

    <div class="container-fluid mt-2">

      <div class="row">
        <div class="col text-center">
          <font-awesome-icon :icon="['fas', 'spinner']" spin v-if="isLoading"></font-awesome-icon>
        </div>
      </div>

      <div class="row" v-if="openOffers.length === 0 && !isLoading">
        <div class="col text-center">
          <code>No outstanding offers</code>
        </div>
      </div>

      <div class="row" v-if="openOffers.length > 0">
        <div class="col">
          <table class="table mx-auto">
            <tbody>
            <tr v-for="offer in openOffers">
              <td class="text-right align-middle" v-if="offer.edition">
                <router-link
                  :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: parseInt(offer.edition) }}">
                  <edition-image class="img-thumbnail"
                                 :src="(findEdition(parseInt(offer.edition)) || {}).lowResImg"/>
                </router-link>
              </td>
              <td class="align-middle">
                <span class="small">User</span>
                <clickable-address :eth-address="offer.highestBidder" class="small"></clickable-address>
                <span class="small">offers</span>
                <price-in-eth :value="offer.highestBid"></price-in-eth>
                <span class="small" v-if="currentUsdPrice">(<usd-price :price-in-ether="offer.highestBid"></usd-price>)</span>
              </td>
              <td class="align-middle text-center">
                <div v-if="isArtist(offer)" title="Accept the offer">
                  <accepting-bid-flow :auction="offer"></accepting-bid-flow>
                </div>
                <div v-if="isBidder(offer)" title="Withdraw the offer">
                  <withdrawing-bid-flow :auction="offer"></withdrawing-bid-flow>
                </div>
                <div v-if="isArtist(offer)" title="Rejct the offer">
                  <reject-bid-flow :auction="offer"></reject-bid-flow>
                </div>
                <div v-if="isKo" title="Close the auction">
                  <cancelling-auction-flow :auction="offer"></cancelling-auction-flow>
                </div>
              </td>
            </tr>
            </tbody>
          </table>

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
  import EditionImage from "../ui-controls/generic/EditionImage";
  import PriceInEth from '../ui-controls/generic/PriceInEth';
  import UsdPrice from "../ui-controls/generic/USDPrice";
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import WithdrawingBidFlow from "../ui-controls/auction/control-flows/WithdrawingBidFlow";
  import AcceptEditionBids from "../ui-controls/auction/AcceptEditionBids";
  import AcceptingBidFlow from "../ui-controls/auction/control-flows/AcceptingBidFlow";
  import CancellingAuctionFlow from "../ui-controls/auction/control-flows/CancelAuctionFlow";
  import RejectBidFlow from "../ui-controls/auction/control-flows/RejectBidFlow";

  export default {
    name: 'openOffers',
    components: {
      RejectBidFlow,
      CancellingAuctionFlow,
      AcceptingBidFlow,
      AcceptEditionBids,
      WithdrawingBidFlow,
      UsdPrice,
      ClickableAddress,
      EditionImage,
      PriceInEth,
      FontAwesomeIcon
    },
    data() {
      return {
        isLoading: false,
        openOffers: []
      };
    },
    computed: {
      ...mapState([
        'currentUsdPrice',
      ]),
      ...mapGetters('kodaV2', [
        'findEdition'
      ]),
      ...mapState([
        'account',
      ]),
      ...mapState('auction', [
        'owner',
      ]),
    },
    methods: {
      isBidder(offer) {
        if (!this.account) {
          return false;
        }
        return offer.highestBidder === this.account;
      },
      isKo() {
        if (!this.account || !this.owner) {
          return false;
        }
        return this.owner === this.account;
      },
      isArtist(offer) {
        if (this.isKo()) {
          return true;
        }
        if (!this.account || !offer.controller) {
          return false;
        }
        return offer.controller === this.account;
      }
    },
    created() {

      const loadOpenOffers = () => {
        this.isLoading = true;
        this.$store.state.auctionsService.getOpenAuctions()
          .then((results) => {
            const {data} = results;
            const editions = _.map(data, 'edition');
            this.openOffers = data;
            this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, editions);
          })
          .finally(() => {
            this.isLoading = false;
          });
      };

      this.$store.watch(
        () => this.$store.state.auctionsService.currentNetworkId,
        () => loadOpenOffers()
      );

      if (this.$store.state.auctionsService) {
        loadOpenOffers();
      }

      this.$store.subscribeAction((action) => {
        if (action.type === `auction/${actions.REFRESH_OPEN_OFFERS}`) {
          loadOpenOffers();
        }
      });

    }
  };
</script>


<style scoped lang="scss">
  @import '../../ko-colours.scss';

  .full-banner {
    p {
      margin-bottom: 0;
    }
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    .container-fluid {
      padding-left: 0;
      padding-right: 0;
    }
  }

  .img-thumbnail {
    max-width: 75px;
  }

  .table {
    vertical-align: middle;
    max-width: 800px;
  }
</style>
