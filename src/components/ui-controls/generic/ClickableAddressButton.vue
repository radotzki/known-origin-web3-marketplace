<template>
  <span v-if="ethAddress">
    <a class="btn btn-outline-primary btn-sm" :href="buildLink" target="_blank">{{ label || dotDotDot }}</a>
  </span>
</template>

<script>
  /* global web3:true */
  import EthAddress from './EthAddress';
  import { mapGetters, mapState } from 'vuex';

  export default {
    name: 'clickableAddressButton',
    components: {EthAddress},
    props: {
      ethAddress: {
        type: String
      },
      label: {
        type: String
      }
    },
    computed: {
      ...mapState([
        'etherscanBase',
      ]),
      dotDotDot: function () {
        if (this.ethAddress) {
          return this.ethAddress.substr(0, 6) + '...' + this.ethAddress.substr(this.ethAddress.length - 6, this.ethAddress.length);
        }
        return '';
      },
      buildLink: function () {
        return `${this.etherscanBase}/address/${this.ethAddress}`;
      }
    }
  };
</script>

<style>

</style>
