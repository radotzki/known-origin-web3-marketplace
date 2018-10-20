<template>
  <div class="mt-4 shadow-sm bg-white p-4"
       v-if="isEditionAuctionEnabled(edition.edition) && auctionEditionEvents(edition.edition).length > 0">
    <h5>Recent events</h5>
    <div v-for="event in limitBy(auctionEditionEvents(edition.edition), 4)">
      <div>
        <strong>{{humanize(event.event)}}</strong>
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
        'isEditionAuctionEnabled',
        'auctionEditionEvents'
      ]),
      ...mapState('auction', []),
    },
    methods: {
      toEth: function (value) {
        return Web3.utils.fromWei(value.toString("10"), 'ether');
      },
      humanize: function (value) {
        return _.startCase(value);
      }
    },
    mounted() {
      this.$store.dispatch(`auction/${actions.GET_AUCTION_EVENTS_FOR_EDITION}`, this.edition.edition);
    },
  };
</script>

<style scoped lang="scss">

</style>
