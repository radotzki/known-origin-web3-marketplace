<template>
  <span class="text-muted" v-if="usdPrice">
    <small>${{ usdPrice }}</small>
  </span>
</template>

<script>
  /* global web3:true */

  import Web3 from 'web3';
  import _ from 'lodash';

  export default {
    name: 'USDPriceConverter',
    props: ['priceInWei', 'usdExchangeRate'],
    computed: {
      usdPrice: function () {
        if (this.usdExchangeRate && this.priceInWei) {
          const value = this.usdExchangeRate * _.toNumber(Web3.utils.fromWei(this.priceInWei, 'ether'));
          return value.toFixed(2);
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
