<template>
  <div class="mt-4 shadow-sm bg-white p-4" v-if="auctionEvents.length > 0">
    <h6>Recent events</h6>

    <div v-for="event in limitBy(orderBy(auctionEvents, 'blockNumber', -1), 5)" class="mt-4">

      <div>
        <code class="small">{{event.event | humanize}}</code>
        <small v-if="event.blockTimestamp">
          {{ event.blockTimestamp | moment('DD/MM/YYYY')}}
        </small>
        <span class="float-right" v-if="event._args._amount">
          <price-in-eth :value="event._args._amount | toEth" class="small"></price-in-eth>
          <u-s-d-price-converter
            :price-in-wei="event._args._amount"
            :usd-exchange-rate="event.exchangeRate.usd">
          </u-s-d-price-converter>
        </span>
      </div>

      <div v-if="event._args._bidder" class="mb-2">
        <clickable-address :eth-address="event._args._bidder" class="small"></clickable-address>
        <view-transaction-details :transaction="event.transactionHash"
                                  class="float-right small"></view-transaction-details>
      </div>
    </div>
  </div>
</template>

<script>
  import ClickableAddress from '../generic/ClickableAddress';
  import PriceInEth from '../generic/PriceInEth';
  import USDPrice from '../generic/USDPrice';
  import ClickableTransaction from '../generic/ClickableTransaction';
  import ViewTransactionDetails from '../generic/ViewTransactionDetails';
  import USDPriceConverter from "../generic/USDPriceConverter";

  export default {
    name: 'auctionEventsList',
    components: {
      ViewTransactionDetails,
      ClickableTransaction,
      PriceInEth,
      ClickableAddress,
      USDPriceConverter,
      USDPrice
    },
    props: {
      edition: {
        type: Object
      }
    },
    data() {
      return {
        auctionEvents: []
      };
    },
    computed: {},
    methods: {},
    created() {

      const loadData = () => {
        this.$store.state.eventService
          .loadAuctionEvents(this.edition)
          .then((auctionEvents) => {
            this.auctionEvents = auctionEvents;
          });
      };

      this.$store.watch(
        () => this.$store.state.eventService.firebasePath,
        () => loadData()
      );

      if (this.$store.state.eventService.firebasePath) {
        loadData();
      }
    },
  };
</script>

<style scoped lang="scss">

</style>
