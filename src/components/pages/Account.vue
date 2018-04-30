<template>
  <div class="container">

    <h1>Account ({{assetsPurchasedByAccount.length}})</h1>

    <div class="row mb-4">
      <div class="col">
        <address-icon :eth-address="account"></address-icon>
      </div>
    </div>

    <div class="card-columns" v-if="assetsPurchasedByAccount.length > 0">
      <asset v-for="tokenId, key in assetsPurchasedByAccount"
             :asset="assetById(tokenId)"
             :key="key">
      </asset>
    </div>

    <div v-if="assetsPurchasedByAccount.length == 0" class="row text-center">
      <div class="col">You don't have any digital assets yet...</div>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import Artist from '../Artist';
  import Gallery from './Gallery';
  import Asset from '../Asset';
  import AddressIcon from '../ui-controls/AddressIcon';
  import EthAddress from '../ui-controls/EthAddress';

  export default {
    name: 'account',
    components: {Asset, AddressIcon, EthAddress},
    computed: {
      ...mapState([
        'account',
        'accountBalance',
        'assetsPurchasedByAccount',
      ]),
      ...mapGetters([
        'assetById',
      ])
    },
    mounted() {}
  };
</script>

<style scoped>
  img {
    width: auto;
  }
</style>
