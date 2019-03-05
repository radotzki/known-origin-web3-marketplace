<template>
  <div>
    <div class="row bg-primary full-banner-secondary pt-3 mt-1">
      <div class="col text-center">
        Platform
      </div>
    </div>

    <div class="mt-3 text-center">
      <font-awesome-icon :icon="['fas', 'spinner']" spin></font-awesome-icon>
    </div>

    <div class="container-fluid mt-4">

      <div class="row mt-5 justify-content-sm-center" v-if="!loading">
        <div class="col-sm-4">
          <h3>Platform Overview</h3>
          <table class="table table-striped bg-white text-center">
            <tbody>
            <tr v-if="totals.purchase">
              <td>Purchases</td>
              <td>{{ totals.purchase }}</td>
            </tr>
            <tr v-if="totals.eth">
              <td>ETH Raised</td>
              <td>{{ totals.eth | to4Dp }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="row mt-5 justify-content-sm-center" v-if="!loading">
        <div class="col-sm-4">
          <clickable-address-button :eth-address="kodaV2.address" :label="'View Smart Contract'"
                                    v-if="kodaV2.address" class="float-right"></clickable-address-button>
          <h3>KODA v2</h3>
          <small>04-09-2018 - Present</small>
          <table class="table table-striped bg-white text-center">
            <tbody>
            <tr>
              <td>Smart Contract</td>
              <td>
                <clickable-address :eth-address="kodaV2.address"></clickable-address>
              </td>
            </tr>
            <tr v-if="kodaV2.totalSupply">
              <td>Purchases</td>
              <td>{{ kodaV2.totalSupply }}</td>
            </tr>
            <tr v-if="kodaV2.totalNumberAvailable">
              <td>Artworks Available</td>
              <td>{{ kodaV2.totalNumberAvailable }}</td>
            </tr>
            <tr v-if="kodaV2.totalEditions">
              <td>Editions Available</td>
              <td>{{ kodaV2.totalEditions }}</td>
            </tr>
            <tr>
              <td>Total Artists</td>
              <td>{{ liveArtists.length }}</td>
            </tr>
            <tr v-if="kodaV2.totalPurchaseValueInEther">
              <td>Total</td>
              <td>{{ kodaV2.totalPurchaseValueInEther | to4Dp }} ETH</td>
            </tr>
            <tr v-if="kodaV2.koCommissionAccount">
              <td>Commission Account</td>
              <td>
                <clickable-address :eth-address="kodaV2.koCommissionAccount"></clickable-address>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="row mt-5 justify-content-sm-center" v-if="!loading">
        <div class="col-sm-4">
          <clickable-address-button :eth-address="auctionV2.address"
                                    :label="'View Smart Contract'"
                                    v-if="auctionV2.address" class="float-right">
          </clickable-address-button>
          <h3>Auction</h3>
          <table class="table table-striped bg-white text-center">
            <tbody>
            <tr>
              <td>Smart Contract</td>
              <td>
                <clickable-address :eth-address="auctionV2.address"></clickable-address>
              </td>
            </tr>
            <tr>
              <td>Bids Accepted</td>
              <td>{{ auctionV2.bidsAccepted }}</td>
            </tr>
            <tr>
              <td>ETH Accepted</td>
              <td>{{ auctionV2.ethAccepted | to4Dp }}</td>
            </tr>
            <tr>
              <td>ETH Placed</td>
              <td>{{ auctionV2.ethPlaced | to4Dp }}</td>
            </tr>
            <tr>
              <td>Current Balance</td>
              <td>{{ auctionV2.balance | to4Dp }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="row mt-5 justify-content-sm-center" v-if="!loading">
        <div class="col-sm-4">
          <clickable-address-button :eth-address="kodaV1.address" :label="'View Smart Contract'"
                                    v-if="kodaV1.address" class="float-right"></clickable-address-button>
          <h3>KODA v1</h3>
          <small>02-04-2018 - 04-09-2018</small>
          <table class="table table-striped bg-white text-center">
            <tbody>
            <tr>
              <td>Smart Contract</td>
              <td>
                <clickable-address :eth-address="kodaV1.address"></clickable-address>
              </td>
            </tr>
            <tr v-if="kodaV1.totalNumberOfPurchases">
              <td>Purchases</td>
              <td>{{ kodaV1.totalNumberOfPurchases }}</td>
            </tr>
            <tr v-if="kodaV1.totalPurchaseValueInEther">
              <td>Total</td>
              <td>{{ kodaV1.totalPurchaseValueInEther | to4Dp }} ETH</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import ClickableAddress from '../ui-controls/generic/ClickableAddress';
  import ClickableAddressButton from '../ui-controls/generic/ClickableAddressButton';
  import { mapGetters, mapState } from 'vuex';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    name: 'contractDetails',
    components: {
      FontAwesomeIcon,
      ClickableAddressButton,
      ClickableAddress
    },
    data () {
      return {
        loading: false,
        kodaV1: {},
        kodaV2: {},
        auctionV2: {},
        totals: {}
      };
    },
    computed: {
      ...mapGetters([
        'liveArtists',
      ]),
    },
    created () {
      this.loading = true;
      const loadApiData = () => {
        this.$store.state.statsService.getContractStates()
          .then((results) => {
            const {auctionV2, kodaV2, kodaV1, totals} = results.data;
            this.kodaV1 = kodaV1;
            this.kodaV2 = kodaV2;
            this.auctionV2 = auctionV2;
            this.totals = totals;
          })
          .finally(() => {
            this.loading = false;
          });
      };

      this.$store.watch(
        () => this.$store.state.statsService.currentNetworkId,
        () => loadApiData()
      );

      if (this.$store.state.statsService.currentNetworkId) {
        loadApiData();
      }
    }
  };
</script>

<style scoped lang="scss">

  /* mobile only */
  @media screen and (max-width: 767px) {
    .container-fluid {
      padding-left: 0;
      padding-right: 0;
    }
  }
</style>
