<template>
  <div v-if="canRejectBid()">

    <div>
      <button class="btn btn-outline-warning btn-sm"
              v-on:click="rejectBid()">
        Reject
      </button>
    </div>

    <div class="mt-1 small">
      <span v-if="isRejectedBidTriggered(auction.edition)">
        Transaction triggered
        <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
        <clickable-transaction :transaction="getRejectedBidTransactionForEdition(auction.edition)"
                               :show-label="false">
        </clickable-transaction>
      </span>

      <span v-else-if="isRejectedBidStarted(auction.edition)">
        Your transaction is being confirmed...<br />
        <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
        <clickable-transaction :transaction="getRejectedBidTransactionForEdition(auction.edition)"
                               :show-label="false">
        </clickable-transaction>
      </span>

      <span v-else-if="isRejectedBidSuccessful(auction.edition)">
        Bid Rejected
        <clickable-transaction :transaction="getRejectedBidTransactionForEdition(auction.edition)"
                               :show-label="false">
        </clickable-transaction>
      </span>

      <span v-else-if="isRejectedBidFailed(auction.edition)">
          <span class="card-text text-danger mt-4">Your transaction failed!</span>
          <img src="../../../../../static/Failure.svg" style="width: 15px"/>
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
    name: 'rejectBidFlow',
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
      ...mapState('auction', [
        'owner',
      ]),
      ...mapGetters('auction', [
        'isRejectedBidTriggered',
        'isRejectedBidStarted',
        'isRejectedBidSuccessful',
        'isRejectedBidFailed',
        'getRejectedBidTransactionForEdition',
      ]),
    },
    methods: {
      canRejectBid: function () {
        return (this.account && this.auction) && this.auction.highestBidWei > 0 && (this.auction.controller === this.account || this.account === this.owner);
      },
      rejectBid: function () {
        this.$store.dispatch(`auction/${actions.REJECT_BID}`, this.auction);
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
