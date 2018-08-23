<template>
  <div class="container">

    <h1>Account <span class="badge badge-primary" v-if="assetsPurchasedByAccount.length > 0">{{ assetsPurchasedByAccount.length }}</span></h1>

    <div class="row mb-4">
      <div class="col">
        <clickable-address :eth-address="account"></clickable-address>
      </div>
    </div>


    <div class="row editions-wrap" v-if="assetsPurchasedByAccount.length > 0">
      <div class="card-deck">
        <div class="col-auto mx-auto mb-5" v-for="tokenId, key in assetsPurchasedByAccount" :key="key">
          <div class="card shadow-sm">

            <img class="card-img-top" :src="assetById(tokenId).lowResImg"/>
            <div class="card-body">
              <p class="card-title">{{ assetById(tokenId).artworkName }}</p>
              <img :src="findArtist(assetById(tokenId).artistCode).img" class="artist-avatar"/>
              <span class="pl-1 artist-name">{{ assetById(tokenId).otherMeta.artist }}</span>
            </div>
            <div class="card-footer bg-danger text-white text-center">
              SOLD
            </div>
          </div>
        </div>
      </div>
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
      ...mapGetters([
        'liveArtists',
        'findArtist'
      ]),
      ...mapGetters('assets', [
        'assetById',
      ])
    },
    mounted () {}
  };
</script>

<style scoped>
  img {
    width: auto;
  }
</style>
