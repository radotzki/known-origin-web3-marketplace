<template>
  <div id="account">
    <header id="header">
      <router-link :to="{ name: 'account' }" class="pull-right">
        <img src="/../static/account.svg" style="height:25px"/>
      </router-link>
      <div class="header-branding">
        &nbsp;
        <router-link :to="{ name: 'home' }" class="back-arrow" style="float: left">
          <img src="../../../static/back_arrow.svg" style="width: 35px"/>
        </router-link>
      </div>
    </header>

    <h1>My Account</h1>

    <img src="/../static/account.svg" style="height:50px"/>

    <h3>My Address</h3>
    <p class="pad-bottom">
    <address-icon :eth-address="account"></address-icon>
    </p>

    <h2>My collection ({{assetsPurchasedByAccount.length}})</h2>

    <div>
      <section class="cards centered" v-if="assetsPurchasedByAccount">
        <asset v-for="tokenId, key in assetsPurchasedByAccount"
               :asset="assetById(tokenId)"
               :key="key">
        </asset>
      </section>

      <section v-if="assetsPurchasedByAccount.length == 0" class="text-center">
        <p>You don't have any digital assets yet...</p>

        <div class="pad-top">
          <router-link :to="{ name: 'gallery'}" class="btn btn-link">
            View gallery
          </router-link>
        </div>
      </section>
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
    }
  };
</script>

<style scoped>
  img {
    width: auto;
  }
</style>
