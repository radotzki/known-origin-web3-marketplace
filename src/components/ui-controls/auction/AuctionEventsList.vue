<template>
  <div class="mt-4 shadow-sm bg-white p-4" v-if="auctionEvents.length > 0">
    <h6>Recent events</h6>

    <div v-for="event in limitBy(orderBy(auctionEvents, 'blockNumber', -1), 10)">

      <div>
        <code>{{event.event | humanize}}</code>
        <span class="float-right" v-if="event._args._amount">
          <price-in-eth :value="event._args._amount | toEth"></price-in-eth>
          <u-s-d-price :price-in-ether="event._args._amount | toEth"></u-s-d-price>
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
      return {
        auctionEvents: []
      };
    },
    computed: {
    },
    methods: {},
    created() {

      const loadData = () => {
        const rootReference = this.$store.state.firestore
          .collection('raw')
          .doc(this.$store.state.firebasePath);

        const auctionRef = rootReference.collection('auction-v1');
        const editionString = this.edition.edition.toString();

        Promise.all([
          auctionRef.where("event", '==', "BidPlaced").where("_args._editionNumber", '==', editionString).orderBy("blockNumber", "desc").limit(5).get(),
          auctionRef.where("event", '==', "BidAccepted").where("_args._editionNumber", '==', editionString).orderBy("blockNumber", "desc").limit(5).get(),
          auctionRef.where("event", '==', "BidIncreased").where("_args._editionNumber", '==', editionString).orderBy("blockNumber", "desc").limit(5).get(),
          auctionRef.where("event", '==', "AuctionCancelled").where("_args._editionNumber", '==', editionString).orderBy("blockNumber", "desc").limit(5).get(),
        ])
          .then((querySet) => {
            _.forEach(querySet, (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                this.auctionEvents.push(doc.data());
              });
            });
          });
      };

      this.$store.watch(
        () => this.$store.state.firebasePath,
        () => loadData()
      );

      if (this.$store.state.firebasePath) {
        loadData();
      }
    },
  };
</script>

<style scoped lang="scss">

</style>
