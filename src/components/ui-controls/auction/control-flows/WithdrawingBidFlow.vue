<template>
  <div v-if="canWithdrawBid()">

    <div>
      <button class="btn btn-outline-primary btn-sm"
              v-on:click="withdrawBid()">
        Withdraw Bid
      </button>
    </div>

    <div class="mt-2">
      <span v-if="isWithdrawnBidTriggered(auction.edition)">
        Transaction triggered
        <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
        <clickable-transaction :transaction="getWithdrawnBidTransactionForEdition(auction.edition)"
                               :show-label="false">
        </clickable-transaction>
      </span>

      <span v-else-if="isWithdrawnBidStarted(auction.edition)">
        Your transaction is being confirmed...
        <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
        <clickable-transaction :transaction="getWithdrawnBidTransactionForEdition(auction.edition)"
                               :show-label="false">
        </clickable-transaction>
      </span>

      <span v-else-if="isWithdrawnBidSuccessful(auction.edition)">
        Bid withdrawn
        <clickable-transaction :transaction="getWithdrawnBidTransactionForEdition(auction.edition)"
                               :show-label="false">
        </clickable-transaction>
      </span>

      <span v-else-if="isWithdrawnBidFailed(auction.edition)">
          <span class="card-text text-danger mt-4">Your transaction failed!</span>
          <img src="../../../../../static/Failure.svg" style="width: 25px"/>
      </span>

    </div>
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import * as actions from '../../../../store/actions';
  import {PAGES} from '../../../../store/loadingPageState';
  import ClickableAddress from '../../../ui-controls/generic/ClickableAddress';
  import EthAddress from '../../../ui-controls/generic/EthAddress';
  import PriceInEth from '../../../ui-controls/generic/PriceInEth';
  import UsdPrice from '../../../ui-controls/generic/USDPrice';
  import ClickableTransaction from '../../../ui-controls/generic/ClickableTransaction';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    name: 'withdrawingBidFlow',
    components: {
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
      ...mapGetters('auction', [
        'isWithdrawnBidTriggered',
        'isWithdrawnBidStarted',
        'isWithdrawnBidSuccessful',
        'isWithdrawnBidFailed',
        'getWithdrawnBidTransactionForEdition',
      ]),
    },
    methods: {
      canWithdrawBid: function () {
        return (this.account && this.auction) &&
          this.auction.highestBidWei > 0 && (this.auction.highestBidder === this.account);
      },
      withdrawBid: function () {
        this.$store.dispatch(`auction/${actions.WITHDRAW_BID}`, this.auction);
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
