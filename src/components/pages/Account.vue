<template>
  <div>

    <div class="row bg-primary full-banner-secondary pt-3 mt-1">
      <div class="col text-center">
        Account
      </div>
    </div>

    <div class="container-fluid mt-4">

      <div class="row pb-2 mt-3">
        <div class="col-12">
          <address-icon :eth-address="account"></address-icon>
          <span class="badge badge-primary" v-if="totalPurchases() > 0 ">{{ totalPurchases() }}</span>

          <code v-if="!account" class="mt-2">
            Looks like we cant see your account, have you logged into your wallet yet? 🔐
          </code>

        </div>
      </div>

      <b-tabs>

        <b-tab title="Owned" active>

          <!-- V2 -->
          <div class="row editions-wrap mt-3" v-if="accountOwnedEditions.length > 0">

            <div class="col-12">
              <h5 class="mb-3">KODA V2</h5>
            </div>

            <div class="card-deck">
              <div class="col-sm-3 mb-5"
                   v-for="edition, editionNumber in limitBy(accountOwnedEditions, currentListV2)"
                   :key="edition.tokenId">
                <gallery-card :edition="edition" :editionNumber="editionNumber"
                              :token-id="edition.tokenId"></gallery-card>
              </div>
            </div>
          </div>

          <div class="row editions-wrap pt-1 pb-4" v-if="canShowMoreV2">
            <div class="col-12 text-center">
              <button @click="showMoreV2" class="btn btn-block btn-outline-primary mt-1 mb-5 ml-3 mr-3">
                Show more
              </button>
            </div>
          </div>

          <!-- V1 -->
          <div class="row editions-wrap" v-if="assetsOwnedByAccount.length > 0">

            <div class="col-12">
              <h5 class="mb-3">KODA V1</h5>
            </div>

            <div class="col-sm-3 mb-5"
                 v-for="asset in limitBy(assetsOwnedByAccount, currentListV1)"
                 :key="asset.tokenId">
              <router-link :to="{ name: 'legacy-asset', params: { legacyTokenId: asset.tokenId } }"
                           class="card-target">
                <div class="card shadow-sm">
                  <edition-image class="card-img-top" :src="asset.lowResImg" :id="asset.tokenId"/>
                  <div class="card-body">
                    <p class="card-title">
                      {{ asset.artworkName }}
                    </p>
                  </div>
                  <div class="card-footer bg-white no-top-border">
                    <div class="mb-2">
                      <token-id-badge :token-id="asset.tokenId" v-if="asset && asset.tokenId"></token-id-badge>
                    </div>
                    <img :src="findArtist(asset.artistCode).logo" class="artist-avatar"/>
                    <span class="pl-1 artist-name">{{ asset.otherMeta.artist }}</span>
                  </div>
                </div>
              </router-link>
            </div>
          </div>

          <div class="row editions-wrap pt-1 pb-4" v-if="canShowMoreV1">
            <div class="col-12 text-center">
              <button @click="showMoreV1" class="btn btn-outline-primary mt-1 mb-5 ml-3 mr-3">
                Show more
              </button>
            </div>
          </div>

          <div
            v-if="totalPurchases() === 0"
            class="row justify-content-sm-center no-assets">
            <div class="col col-sm-6 text-center mt-4">
              <code>You don't own any digital assets yet.</code>
            </div>
          </div>

        </b-tab>

        <b-tab title="Favourites">

          <account-favorites class="mt-3" v-if="account"></account-favorites>

          <div v-if="!account" class="mt-3">
            Looks like we cant see your account
          </div>

        </b-tab>


        <b-tab title="Activity">

          <account-activity class="mt-3" v-if="account"></account-activity>

          <div v-if="!account" class="mt-3">
            Looks like we cant see your account
          </div>

        </b-tab>

      </b-tabs>

    </div>
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import Asset from '../ui-controls/v1/Asset';
  import AddressIcon from '../ui-controls/generic/AddressIcon';
  import EthAddress from '../ui-controls/generic/EthAddress';
  import ClickableAddress from '../ui-controls/generic/ClickableAddress';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import {PAGES} from '../../store/loadingPageState';
  import * as actions from '../../store/actions';
  import HighResLabel from '../ui-controls/highres/HighResLabel';
  import GalleryCard from '../ui-controls/cards/GalleryCard';
  import PurchaseTransactionBadge from '../ui-controls/badges/PurchaseTransactionBadge';
  import EditionImage from '../ui-controls/generic/EditionImage';
  import TokenIdBadge from '../ui-controls/badges/TokenIdBadge';
  import AccountActivity from "../ui-controls/account/AccountActivity";
  import AccountFavorites from "../ui-controls/account/AccountFavorites";

  export default {
    name: 'account',
    components: {
      AccountFavorites,
      AccountActivity,
      TokenIdBadge,
      EditionImage,
      PurchaseTransactionBadge,
      GalleryCard,
      HighResLabel,
      LoadingSection,
      Asset,
      AddressIcon,
      EthAddress,
      ClickableAddress
    },
    data() {
      return {
        PAGES: PAGES,
        currentListV1: 12,
        currentListV2: 20,
      };
    },
    methods: {
      showMoreV1: function () {
        this.currentListV1 = this.currentListV1 + 12;
        console.log(this.currentListV1);
      },
      showMoreV2: function () {
        this.currentListV2 = this.currentListV2 + 20;
        console.log(this.currentListV2);
      },
    },
    computed: {
      ...mapState([
        'account',
        'currentNetworkId',
      ]),
      ...mapGetters([
        'findArtist',
        'totalPurchases',
        'findArtistsForAddress'
      ]),
      ...mapState('kodaV2', [
        'assets',
        'accountOwnedEditions'
      ]),
      ...mapState('kodaV1', [
        'assetsOwnedByAccount',
      ]),
      canShowMoreV1: function () {
        const totalAvailable = _.size(this.assetsOwnedByAccount);
        if (totalAvailable === 0) {
          return false;
        }
        return totalAvailable > this.currentListV1;
      },
      canShowMoreV2: function () {
        const totalAvailable = _.size(this.accountOwnedEditions);
        if (totalAvailable === 0) {
          return false;
        }
        return totalAvailable > this.currentListV2;
      },
    },
    created() {
      // this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ACCOUNT);

      const loadData = () => {
        this.$store.dispatch(`kodaV2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account: this.account})
          .finally(() => {
            // this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.ACCOUNT);
          });
      };

      this.$store.watch(() => this.$store.state.account, () => loadData());

      if (this.$store.state.account && this.$store.state.currentNetworkId) {
        loadData();
      }
    },
    destroyed() {
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

  .no-assets {
    min-height: 350px;
  }

  @import '../../ko-card.scss';
</style>
