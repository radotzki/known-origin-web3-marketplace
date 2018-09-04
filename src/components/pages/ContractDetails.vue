<template>
  <div class="container">
    <h1>Contract</h1>
    <div class="row justify-content-center mt-4">
      <div class="col-sm-6 text-center">
        <h2>KODA V1</h2>
        <table class="table table-striped bg-white">
          <tbody>
          <tr v-if="v1.contractAddress">
            <td>Contract</td>
            <td><clickable-address :eth-address="v1.contractAddress"></clickable-address></td>
          </tr>
          <tr v-if="v1.totalSupply">
            <td>Supply</td>
            <td>{{ v1.totalSupply }}</td>
          </tr>
          <tr v-if="v1.totalNumberOfPurchases">
            <td>Sales</td>
            <td>{{ v1.totalNumberOfPurchases }}</td>
          </tr>
          <tr v-if="v1.totalPurchaseValueInEther">
            <td>Total</td>
            <td>{{ v1.totalPurchaseValueInEther }} ETH</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="col-sm-6 text-center">
        <h2>KODA V2</h2>
        <table class="table table-striped bg-white">
          <tbody>
          <tr v-if="v2.contractAddress">
            <td>Contract</td>
            <td><clickable-address :eth-address="v2.contractAddress"></clickable-address></td>
          </tr>
          <tr v-if="v2.totalSupply">
            <td>Purchases</td>
            <td>{{ v2.totalSupply }}</td>
          </tr>
          <tr v-if="v2.totalNumberAvailable">
            <td>Artworks Available</td>
            <td>{{ v2.totalNumberAvailable }}</td>
          </tr>
          <tr v-if="v2.totalNumberMinted">
            <td>Artworks Minted</td>
            <td>{{ v2.totalNumberMinted }}</td>
          </tr>
          <tr v-if="v2.totalPurchaseValueInEther">
            <td>Total</td>
            <td>{{ v2.totalPurchaseValueInEther }} ETH</td>
          </tr>
          <tr v-if="v2.koCommissionAccount">
            <td>Commission Account</td>
            <td>
              <clickable-address :eth-address="v2.koCommissionAccount"></clickable-address>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>

  import ClickableAddress from '../ui-controls/generic/ClickableAddress';
  import * as actions from '../../store/actions';

  export default {
    name: 'contractDetails',
    components: {ClickableAddress},
    computed: {
      v1: function () {
        return {
          contractAddress: this.$store.state.kodaV1.contractAddress,
          totalSupply: this.$store.state.kodaV1.totalSupply,
          totalNumberOfPurchases: this.$store.state.kodaV1.totalNumberOfPurchases,
          totalPurchaseValueInEther: this.$store.state.kodaV1.totalPurchaseValueInEther,
        };
      },
      v2: function () {
        return {
          contractAddress: this.$store.state.kodaV2.contractAddress,
          totalSupply: this.$store.state.kodaV2.totalSupply,
          totalPurchaseValueInEther: this.$store.state.kodaV2.totalPurchaseValueInEther,
          totalNumberMinted: this.$store.state.kodaV2.totalNumberMinted,
          totalNumberAvailable: this.$store.state.kodaV2.totalNumberAvailable,
          koCommissionAccount: this.$store.state.kodaV2.koCommissionAccount,
        };
      }
    },
    created() {
      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        () => this.$store.dispatch(`kodaV2/${actions.REFRESH_CONTRACT_DETAILS}`)
      );
      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV1,
        () => this.$store.dispatch(`kodaV1/${actions.REFRESH_CONTRACT_DETAILS}`)
      );

      if (this.$store.state.KnownOriginDigitalAssetV1) {
        this.$store.dispatch(`kodaV1/${actions.REFRESH_CONTRACT_DETAILS}`);
      }
      if (this.$store.state.KnownOriginDigitalAssetV2) {
        this.$store.dispatch(`kodaV2/${actions.REFRESH_CONTRACT_DETAILS}`);
      }
    }
  };
</script>

<style scoped>
</style>
