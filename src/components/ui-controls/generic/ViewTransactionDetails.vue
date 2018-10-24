<template>
  <span v-if="transaction">
    <a class="small" :href="buildLink" target="_blank">[view tx]</a>
  </span>
</template>

<script>
  /* global web3:true */
  import EthAddress from './EthAddress';
  import {mapGetters, mapState} from 'vuex';

  export default {
    name: 'viewTransactionDetails',
    components: {},
    props: {
      transaction: {
        type: String
      },
    },
    computed: {
      ...mapState([
        'etherscanBase',
      ]),
      dotDotDot: function () {
        if (this.transaction) {
          return this.transaction.substr(0, 6) + '...' + this.transaction.substr(this.transaction.length - 6, this.transaction.length);
        }
        return '';
      },
      buildLink: function () {
        return `${this.etherscanBase}/tx/${this.transaction}`;
      }
    }
  };
</script>

<style>

</style>
