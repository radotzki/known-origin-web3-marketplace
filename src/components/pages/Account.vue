<template>
  <div class="container">

    <h1>Account <span class="badge badge-primary" v-if="assetsPurchasedByAccount.length > 0">{{ assetsPurchasedByAccount.length }}</span></h1>

    <div class="row mb-4">
      <div class="col">
        <clickable-address :eth-address="account"></clickable-address>
      </div>
    </div>


    <div class="row editions-wrap" v-if="assetsPurchasedByAccount.length > 0 || accountOwnedEditions.length > 0">
      <div class="card-deck">

        <!-- V1 -->
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

        <!-- V2 -->
        <div class="col-auto mx-auto mb-5" v-for="edition in accountOwnedEditions">
          <div class="card shadow-sm">
            <img class="card-img-top" :src="edition.lowResImg"/>
            <div class="card-body">
              <p class="card-title">{{ edition.otherMeta.artworkName }}</p>
              <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
              <span class="pl-1 artist-name">{{ edition.otherMeta.artist }}</span>
            </div>
            <div class="card-footer bg-danger text-white text-center">
              SOLD
            </div>
          </div>
        </div>

      </div>
    </div>


    <div v-if="assetsPurchasedByAccount && accountOwnedEditions && assetsPurchasedByAccount.length == 0 && accountOwnedEditions.length == 0" class="row justify-content-sm-center">
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
      ...mapState('v2', [
        'accountOwnedEditions'
      ]),
      ...mapGetters([
        'liveArtists',
        'findArtist',
        'findArtistsForAddress'
      ]),
      ...mapGetters('assets', [
        'assetById',
      ])
    },
    mounted () {}
  };
</script>

<style scoped>
  .card-img-top {
    object-fit: cover;
    height: 12rem;
  }

  .card {
    width: 14rem;
    height: 21.5rem;
  }

  .card-title {
    font-size: 0.9rem;
  }

  .card-body {
    padding: 1rem;
  }

  .card-footer {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .card-target {
    color: inherit;
  }

  a:hover {
    text-decoration: none;
  }

  .sub-filter {
    cursor:pointer;
    padding-left: 3rem;
    padding-right: 3rem;
  }

  .editions-wrap {
    margin-left: 50px;
    margin-right: 50px;
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    .card-deck {
      flex-flow: row wrap;
    }

    .card-img-top {
      object-fit: cover;
      height: 15rem;
    }

    .card {
      width: 18.5rem;
      height: 25rem;
    }

    .full-banner {
      font-size: 1.5rem;
    }

    .sub-filter {
      padding-left: 0.7rem;
      padding-right: 0.7rem;
    }

    .editions-wrap {
      margin-left: -30px;
      margin-right: -30px;
    }
  }

  .artist-name {
    font-size: 0.65rem;
  }

  .artist-avatar {
    max-width: 30px;
  }
</style>
