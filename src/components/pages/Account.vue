<template>
  <div>

    <div class="row bg-secondary text-white full-banner">
      <div class="col text-center m-5">
        <p>Account <span class="badge badge-light" v-if="totalPurchases() > 0 ">{{ totalPurchases() }}</span></p>

      </div>
    </div>

    <div class="container mt-4">
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
                  <p class="card-title">
                    {{ asset.artworkName }}
                  </p>
                </div>
                <div class="card-footer bg-white no-top-border">
                  <div class="row">
                    <div class="col text-left">{{ asset.priceInEther }} ETH</div>
                    <div class="col text-right">
                      <span class="badge badge-primary">{{ asset.tokenId }}</span>
                      <!--<high-res-label :high-res-available="asset.highResAvailable"></high-res-label>-->
                    </div>
                  </div>
                </div>
                <div class="card-footer bg-white no-top-border">
                  <img :src="findArtist(asset.artistCode).img" class="artist-avatar"/>
                  <span class="pl-1 artist-name">{{ asset.otherMeta.artist }}</span>
                </div>
              </div>
            </router-link>
          </div>

          <!-- V2 -->
          <div class="col-auto mx-auto mb-5" v-for="edition, editionNumber in accountOwnedEditions" :key="editionNumber">
            <token-card :edition="edition" :editionNumber="editionNumber"></token-card>
          </div>

        </div>
      </div>

      <div
        v-if="totalPurchases() === 0"
        class="row justify-content-sm-center">
        <div class="col col-sm-6 text-center">
          <div class="alert alert-secondary" role="alert">You don't own any digital assets yet.</div>
        </div>
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
  import HighResLabel from '../ui-controls/generic/HighResLabel';
  import TokenCard from '../ui-controls/cards/TokenCard';

  export default {
    name: 'account',
    components: {HighResLabel, LoadingSection, Asset, AddressIcon, EthAddress, ClickableAddress, TokenCard},
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
