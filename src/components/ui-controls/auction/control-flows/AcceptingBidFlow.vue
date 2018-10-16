<template>
  <div v-if="canAcceptBid()">

    <button class="btn btn-outline-primary btn-sm"
            v-on:click="acceptBid()">
      Accept Bid
    </button>

    <span v-if="isAcceptingBidTriggered(auction.edition)">
      Transaction triggered
      <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
      <clickable-transaction :transaction="getAcceptingBidTransactionForEdition(auction.edition)"
                             :show-label="false">
      </clickable-transaction>
    </span>

    <span v-else-if="isAcceptingBidStarted(auction.edition)">
      Your transaction is being confirmed...
      <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
      <clickable-transaction :transaction="getAcceptingBidTransactionForEdition(auction.edition)"
                             :show-label="false">
      </clickable-transaction>
    </span>

    <span v-else-if="isAcceptingBidSuccessful(auction.edition)">
      Bid confirmed
      <clickable-transaction :transaction="getAcceptingBidTransactionForEdition(auction.edition)"
                             :show-label="false">
      </clickable-transaction>
    </span>

    <span v-else-if="isAcceptingBidFailed(auction.edition)">
        <span class="card-text text-danger mt-4">Your transaction failed!</span>
        <img src="../../../../../static/Failure.svg" style="width: 25px"/>
    </span>

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
    name: 'acceptingBidFlow',
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
        'isAcceptingBidTriggered',
        'isAcceptingBidStarted',
        'isAcceptingBidSuccessful',
        'isAcceptingBidFailed',
        'getAcceptingBidTransactionForEdition',
      ]),
    },
    methods: {
      canAcceptBid: function () {
        // The owner and the artist can accept bids
        return this.auction.highestBidWei > 0 && this.auction.controller === this.account || this.account === this.owner;
      },
      acceptBid: function () {
        this.$store.dispatch(`auction/${actions.ACCEPT_BID}`, this.auction);
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
