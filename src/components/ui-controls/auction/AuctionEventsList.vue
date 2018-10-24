<template>
  <div class="mt-4 shadow-sm bg-white p-4"
       v-if="isEditionAuctionEnabled(edition.edition) && auctionEditionEvents(edition.edition).length > 0">
    <h5>Recent events</h5>

    <div v-for="event in limitBy(auctionEditionEvents(edition.edition), 5)">

      <div>
        <strong>{{event.event | humanize}}</strong>
        <span class="float-right" v-if="event.args._amount">
          <price-in-eth :value="event.args._amount | toEth"></price-in-eth>
        </span>
      </div>

      <div>
        <span v-if="event.args._bidder">
          <clickable-address :eth-address="event.args._bidder"></clickable-address>
        </span>

        <span class="float-right">
          <small>Block: {{event.blockNumber}}</small>
          <view-transaction-details :transaction="event.transactionHash"></view-transaction-details>
        </span>

      </div>
      <br/>
    </div>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import * as actions from '../../../store/actions';
  import ClickableAddress from '../generic/ClickableAddress';
  import PriceInEth from '../generic/PriceInEth';
  import USDPrice from '../generic/USDPrice';
  import ClickableTransaction from "../generic/ClickableTransaction";
  import ViewTransactionDetails from "../generic/ViewTransactionDetails";

  export default {
    name: 'auctionEventsList',
    components: {
      ViewTransactionDetails,
      ClickableTransaction,
      PriceInEth,
      ClickableAddress,
      USDPrice
    },
    props: {
      edition: {
        type: Object
      }
    },
    data() {
      return {};
    },
    computed: {
      ...mapGetters('auction', [
        'isEditionAuctionEnabled',
        'auctionEditionEvents'
      ]),
      ...mapState('auction', []),
    },
    methods: {
    },
    mounted() {
      this.$store.dispatch(`auction/${actions.GET_AUCTION_EVENTS_FOR_EDITION}`, this.edition.edition);
    },
  };
</script>

<style scoped lang="scss">

</style>
