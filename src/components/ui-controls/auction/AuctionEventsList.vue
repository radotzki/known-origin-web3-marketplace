<template>
  <div>
    <div v-for="event in auctionEditionEvents(edition.edition)">
      <div>
        <strong>{{event.event}}</strong>
      </div>
      <div>
        <span v-for="value, key in event.args">
          <span v-if="key === '_amount'">
            <price-in-eth :value="toEth(value)"></price-in-eth>
          </span>
          <span v-if="key === '_bidder'">
            <clickable-address :eth-address="value"></clickable-address>
          </span>
        </span>
      </div>
      <div>
        <clickable-transaction :transaction="event.transactionHash"
                               :show-label="false">
        </clickable-transaction>
      </div>
      <br/>
    </div>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import _ from 'lodash';
  import * as actions from '../../../store/actions';
  import ClickableAddress from '../generic/ClickableAddress';
  import PriceInEth from '../generic/PriceInEth';
  import USDPrice from '../generic/USDPrice';
  import ClickableTransaction from "../generic/ClickableTransaction";
  import Web3 from "web3";

  export default {
    name: 'auctionEventsList',
    components: {
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
        'auctionEditionEvents'
      ]),
      ...mapState('auction', []),
    },
    methods: {
      toEth: function (value) {
        return Web3.utils.fromWei(value.toString("10"), 'ether');
      }
    },
    mounted() {
      this.$store.dispatch(`auction/${actions.GET_AUCTION_EVENTS_FOR_EDITION}`, this.edition.edition);
    },
  };
</script>

<style scoped lang="scss">

</style>
