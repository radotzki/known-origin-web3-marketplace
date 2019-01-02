<template>
  <span v-if="transaction">
    <a class="small" :href="buildLink" target="_blank">[view tx]</a>
  </span>
</template>

<script>
  /* global web3:true */
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
      buildLink: function () {
        return `${this.etherscanBase}/tx/${this.transaction}`;
      }
    }
  };
</script>

<style>

</style>
