<template>
  <span class="text-mute" v-if="usdPrice">
    <small>${{ usdPrice }}</small>
  </span>
</template>

<script>
  /* global web3:true */

  import Web3 from 'web3';
  import {mapState} from 'vuex';

  export default {
    name: 'usdPrice',
    props: ['priceInEther'],
    computed: {
      ...mapState([
        'currentUsdPrice',
      ]),
      usdPrice: function () {
        if (this.currentUsdPrice && this.priceInEther) {
          let value = this.currentUsdPrice * this.priceInEther;
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
