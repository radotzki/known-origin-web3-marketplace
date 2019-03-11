<template>
  <div v-if="canCancelAuction()">

    <div>
      <button class="btn btn-outline-danger btn-sm"
              v-on:click="cancelAuction()">
        Disable
      </button>
    </div>

    <div class="mt-1 small">
      <view-transaction-details :transaction="txs">
      </view-transaction-details>
    </div>
  </div>
</template>

<script>

  import {mapState} from 'vuex';
  import * as actions from '../../../../store/actions';
  import {PAGES} from '../../../../store/loadingPageState';
  import ClickableAddress from '../../../ui-controls/generic/ClickableAddress';
  import EthAddress from '../../../ui-controls/generic/EthAddress';
  import PriceInEth from '../../../ui-controls/generic/PriceInEth';
  import UsdPrice from '../../../ui-controls/generic/USDPrice';
  import ClickableTransaction from '../../../ui-controls/generic/ClickableTransaction';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import ViewTransactionDetails from "../../generic/ViewTransactionDetails";

  export default {
    name: 'cancellingAuctionFlow',
    components: {
      ViewTransactionDetails,
      FontAwesomeIcon,
      ClickableTransaction,
      UsdPrice,
      PriceInEth,
      EthAddress,
      ClickableAddress
    },
    data() {
      return {
        PAGES: PAGES,
        txs: null
      };
    },
    props: {
      auction: {
        type: Object,
      }
    },
    computed: {
      ...mapState([
        'account',
      ]),
      ...mapState('auction', [
        'owner',
      ]),
    },
    methods: {
      canCancelAuction: function () {
        return (this.account && this.auction) &&
          this.auction.highestBidWei > 0 &&
          (this.account === this.owner);
      },
      cancelAuction: function () {
        this.$store.dispatch(`auction/${actions.CANCEL_AUCTION}`, this.auction)
          .then((txs) => {
            this.txs = _.get(txs, 'tx');
          });
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
