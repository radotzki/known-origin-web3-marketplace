<template>
  <span class="small text-muted">USD @ {{usdPrice}} PER/ETH</span>
</template>

<script>
  /* global web3:true */

  import Web3 from 'web3';
  import {mapState} from 'vuex';

  export default {
    name: 'usdPricePerEther',
    computed: {
      ...mapState([
        'currentUsdPrice',
      ]),
      usdPrice: function () {
        if (this.currentUsdPrice) {
          return _.toNumber(this.currentUsdPrice).toFixed(2);
        }
        return null;
      }
    }
  };
</script>

<style scoped>
  small {
    font-size: 0.7rem;
  }
</style>
