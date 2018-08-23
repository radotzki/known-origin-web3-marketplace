<template>
  <div class="container">

    <h1>Account <span class="badge badge-primary" v-if="assetsPurchasedByAccount.length > 0">{{ assetsPurchasedByAccount.length }}</span>
    </h1>

    <div class="row mb-4">
      <div class="col">
        <clickable-address :eth-address="account"></clickable-address>
      </div>
    </div>

    <loading-section v-if="!edition" :page="PAGES.ACCOUNT"></loading-section>

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
        <div v-if="accountOwnedEditions && accountOwnedEditions.length > 0">
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
    </div>

    <div
      v-if="assetsPurchasedByAccount && accountOwnedEditions && assetsPurchasedByAccount.length === 0 && accountOwnedEditions.length === 0"
      class="row justify-content-sm-center">
      <div class="col col-sm-6 text-center">
        <div class="alert alert-secondary" role="alert">You don't have any digital assets yet.</div>
        <router-link :to="{ name: 'galleryV2' }" class="btn btn-outline-primary btn-lg">Open gallery</router-link>
      </div>
    </div>

  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import Asset from '../Asset';
  import AddressIcon from '../ui-controls/AddressIcon';
  import EthAddress from '../ui-controls/EthAddress';
  import ClickableAddress from '../ui-controls/ClickableAddress';
  import LoadingSection from "../ui-controls/LoadingSection";
  import {PAGES} from '../../store/loadingPageState';
  import * as actions from '../../store/actions';

  export default {
    name: 'account',
    components: {LoadingSection, Asset, AddressIcon, EthAddress, ClickableAddress},
    data() {
      return {
        PAGES: PAGES
      };
    },
    computed: {
      ...mapState([
        'account',
        'assetsPurchasedByAccount',
      ]),
      ...mapState('v2', [
        'accountOwnedEditions'
      ]),
      ...mapGetters([
        'findArtist',
        'findArtistsForAddress'
      ]),
      ...mapGetters('assets', [
        'assetById',
      ])
    },
    mounted() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ACCOUNT);

      const loadData = function () {
        this.$store.dispatch(`v2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account: this.account})
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.ACCOUNT);
          });
      }.bind(this);

      this.$store.watch(
        () => this.$store.state.account,
        () => loadData()
      );

      if (this.$store.state.account) {
        loadData();
      }
    }
  };
</script>

<style scoped>
  @import '../../ko-card.scss';
</style>
