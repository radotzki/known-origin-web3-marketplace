<template>

  <div class="pt-4" v-if="!account">
    <code class="text-center">
      We can not see your connected ETH Account, is your wallet unlocked?
    </code>
    <p class="text-mute pt-3">
      You need an Web 3 enabled wallet like
      <a href="https://metamask.io" target="_blank">MetaMask</a>,
      <a href="https://trustwalletapp.com" target="_blank">Trust Wallet</a>,
      <a href="https://token.im" target="_blank">imToken</a>,
      <a href="https://www.opera.com/mobile" target="_blank">Opera Mobile</a> or
      <a href="https://portis.io" target="_blank">Portis</a>
      to buy this item.
    </p>
  </div>

</template>

<script>
  import {mapState} from 'vuex';

  export default {
    name: 'AccountNotFound',
    computed: {
      ...mapState([
        'account',
      ]),
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card-flex.scss';
</style>

