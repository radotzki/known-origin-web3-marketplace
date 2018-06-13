<template>
  <div class="container">

    <h1>Account <span class="badge badge-primary" v-if="assetsPurchasedByAccount.length > 0">{{ assetsPurchasedByAccount.length }}</span></h1>

    <div class="row mb-4">
      <div class="col">
        <clickable-address :eth-address="account"></clickable-address>
      </div>
    </div>

    <div class="card-columns" v-if="assetsPurchasedByAccount.length > 0">
      <asset v-for="tokenId, key in assetsPurchasedByAccount"
             :asset="assetById(tokenId)"
             :key="key">
      </asset>
    </div>

    <div v-if="assetsPurchasedByAccount.length == 0" class="row justify-content-sm-center">
      <div class="col col-sm-6 text-center">
        <div class="alert alert-secondary" role="alert">You don't have any digital assets yet.</div>
        <router-link :to="{ name: 'gallery' }" class="btn btn-outline-primary btn-lg">Open gallery</router-link>
      </div>
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
  import ClickableAddress from '../ui-controls/ClickableAddress';

  export default {
    name: 'account',
    components: {Asset, AddressIcon, EthAddress, ClickableAddress},
    computed: {
      ...mapState([
        'account',
        'accountBalance',
        'assetsPurchasedByAccount',
      ]),
      ...mapGetters('assets', [
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
