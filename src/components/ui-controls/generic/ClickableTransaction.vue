<template>
  <span v-if="transaction">
    <span class="small" v-if="showLabel">Transaction:</span> <a class="token-id" :href="buildLink" target="_blank">{{ dotDotDot }}</a>
  </span>
</template>

<script>
  /* global web3:true */
  import EthAddress from './EthAddress';
  import {mapGetters, mapState} from 'vuex';

  export default {
    name: 'clickableTransaction',
    components: {},
    props: {
      transaction: {
        type: String
      },
      showLabel: {
        type: Boolean,
        default: true
      }
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
