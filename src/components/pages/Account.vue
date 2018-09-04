<template>
  <div class="container">

    <h1>
      Account <span class="badge badge-dark" v-if="totalPurchases() > 0 ">{{ totalPurchases() }}</span>
    </h1>

    <div class="row mb-4">
      <div class="col">
        <clickable-address :eth-address="account"></clickable-address>
      </div>
    </div>

    <loading-section :page="PAGES.ACCOUNT"></loading-section>

    <div class="row editions-wrap" v-if="assetsOwnedByAccount.length > 0 || accountOwnedEditions.length > 0">
      <div class="card-deck">

        <!-- V1 -->
        <div class="col-auto mx-auto mb-5" v-for="asset in assetsOwnedByAccount" :key="asset.tokenId">
          <router-link :to="{ name: 'legacy-asset', params: { legacyTokenId: asset.tokenId } }" class="card-target">
            <div class="card shadow-sm">
              <img class="card-img-top" :src="asset.lowResImg"/>
              <div class="card-body">
                <p class="card-title">{{ asset.artworkName }}</p>
                <img :src="findArtist(asset.artistCode).img" class="artist-avatar"/>
                <span class="pl-1 artist-name">{{ asset.otherMeta.artist }}</span>
              </div>
              <div class="card-footer">
                <div class="row">
                  <div class="col text-left">
                    <high-res-label :high-res-available="asset.highResAvailable"></high-res-label>
                  </div>
                  <div class="col text-right">{{ asset.priceInEther }} ETH</div>
                </div>
              </div>
            </div>
          </router-link>
        </div>

        <!-- V2 -->
        <div class="col-auto mx-auto mb-5" v-for="edition in accountOwnedEditions" :key="edition.tokenId">
          <router-link :to="{ name: 'edition-token', params: { tokenId: edition.tokenId }, props: { edition: edition } }" class="card-target">
            <div class="card shadow-sm">
              <img class="card-img-top" :src="edition.lowResImg"/>
              <div class="card-body">
                <p class="card-title">{{ edition.name }}</p>
                <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
                <span class="pl-1 artist-name">{{ findArtistsForAddress(edition.artistAccount).name }}</span>
              </div>
              <div class="card-footer">
                <div class="row">
                  <div class="col text-left">
                    <high-res-label :high-res-available="edition.highResAvailable"></high-res-label>
                  </div>
                  <div class="col text-right">{{ edition.priceInEther }} ETH</div>
                </div>
              </div>
            </div>
          </router-link>
        </div>

      </div>
    </div>

    <div
      v-if="totalPurchases() === 0"
      class="row justify-content-sm-center">
      <div class="col col-sm-6 text-center">
        <div class="alert alert-secondary" role="alert">You don't have any digital assets yet.</div>
        <router-link :to="{ name: 'gallery' }" class="btn btn-outline-primary btn-lg">Open gallery</router-link>
      </div>
    </div>

  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import Asset from '../ui-controls/v1/Asset';
  import AddressIcon from '../ui-controls/generic/AddressIcon';
  import EthAddress from '../ui-controls/generic/EthAddress';
  import ClickableAddress from '../ui-controls/generic/ClickableAddress';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import { PAGES } from '../../store/loadingPageState';
  import * as actions from '../../store/actions';
  import HighResLabel from "../ui-controls/generic/HighResLabel";

  export default {
    name: 'account',
    components: {HighResLabel, LoadingSection, Asset, AddressIcon, EthAddress, ClickableAddress},
    data () {
      return {
        PAGES: PAGES
      };
    },
    computed: {
      ...mapState([
        'account',
      ]),
      ...mapGetters([
        'findArtist',
        'totalPurchases',
        'findArtistsForAddress'
      ]),
      ...mapState('kodaV2', [
        'accountOwnedEditions'
      ]),
      ...mapState('kodaV1', [
        'assetsOwnedByAccount',
      ])
    },
    created () {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ACCOUNT);

      const loadData = function () {
        this.$store.dispatch(`kodaV2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account: this.account})
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
    },
    destroyed () {
    }
  };
</script>

<style scoped lang="scss">
  h1 .badge {
    position: relative;
    top: -25px;
    right: 5px;
    opacity: 0.75;
    font-size: 0.9rem;
  }

  .editions-wrap {
    margin-left: 50px;
    margin-right: 50px;
  }

  @import '../../ko-card.scss';
</style>
