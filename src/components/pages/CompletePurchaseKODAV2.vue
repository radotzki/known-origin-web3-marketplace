<template>
  <div class="container">

    <loading-section v-if="!edition" :page="PAGES.COMPLETE_PURCHASE"></loading-section>

    <div v-if="edition" class="row justify-content-sm-center">
      <div class="col col-sm-6">
        <div class="card shadow-sm">

          <img class="card-img-top" :src="edition.lowResImg"/>

          <div class="card-body">

            <div class="text-center mb-2" v-if="isPurchaseTriggered(edition.edition, account)">
              <loading-spinner></loading-spinner>
              <p class="card-text text-dark mt-4">Your purchase has been initiated</p>
              <p class="card-text text-dark mt-4">Please be patient. Blockchains need to be mined.</p>
              <hr/>
            </div>

            <div class="text-center mb-2" v-if="isPurchaseStarted(edition.edition, account)">
              <loading-spinner></loading-spinner>
              <p class="card-text text-dark mt-4">Your purchase is being confirmed...</p>
              <small class="text-muted">
                <clickable-transaction
                  :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
              </small>
              <hr/>
            </div>

            <div class="text-center mb-2" v-if="isPurchaseSuccessful(edition.edition, account)">
              <img src="../../../static/GreenTick.svg" style="width: 100px"/>
              <p class="card-text text-success mt-4">Your purchase was successful!</p>
              <small class="text-muted">
                <clickable-transaction
                  :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
              </small>
              <hr/>
            </div>

            <div class="text-center mb-2" v-if="isPurchaseFailed(edition.edition, account)">
              <img src="../../../static/Failure.svg" style="width: 100px"/>
              <p class="card-text text-danger mt-4">Your purchase failed!</p>
              <hr/>
            </div>

            <p class="card-title">{{ edition.otherMeta.artworkName }}</p>
            <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
            <span class="pl-1 artist-name">{{ edition.otherMeta.artist }}</span>

          </div>

          <ul class="list-group list-group-flush" v-if="isNotSoldOut() && account">
            <li class="list-group-item">
              <div class="d-inline-block"><img src="/../../static/Account_You_icn.svg" style="height: 50px"/></div>
              <div class="d-inline-block">
                <small class="pl-2 text-muted">You:</small>
                <clickable-address :eth-address="account"></clickable-address>
              </div>
            </li>
            <li class="list-group-item">
              <div class="d-inline-block"><img src="/../../static/Account_You_icn.svg" style="height: 50px"/></div>
              <div class="d-inline-block">
                <small class="pl-2 text-muted">Artist:</small>
                <clickable-address :eth-address="edition.artistAccount"></clickable-address>
              </div>
            </li>
            <li class="list-group-item text-right no-bottom-border font-weight-bold">
              <price-in-eth :value="edition.priceInEther"></price-in-eth>
            </li>
          </ul>

          <div class="card-footer"
               v-if="!isPurchaseFailed(edition.edition, account) && haveNotPurchasedEditionBefore(edition.edition)">
            <form v-if="account">

              <div v-if="edition || !editionPurchaseState(edition.edition)">

                <div class="form-check mb-2" v-if="isNotSoldOut">
                  <label class="form-check-label" :for="'confirm_terms'">
                    <input type="checkbox" :id="'confirm_terms'" v-model="confirm_terms">
                    <span class="pl-2">I agree with the KODA license</span>
                  </label>
                </div>

                <div v-if="isNotSoldOut" class="mb-2">
                  <small>
                    By choosing <strong>I agree</strong>, you understand and agree to KnownOrigin's term of service and
                    usage license.
                    <router-link :to="{ name: 'license' }" target="_blank">Read license</router-link>
                  </small>
                </div>

                <div class="btn-group-vertical btn-block">
                  <button type="button" class="btn btn-success btn-block text-white"
                          :disabled="!confirm_terms || isPurchaseTriggered(edition.edition, account)"
                          v-on:click="completePurchase"
                          v-if="isNotSoldOut || !isPurchaseSuccessful(edition.edition, account)">
                    Confirm
                  </button>

                  <router-link :to="{ name: 'galleryV2'}" tag="button" class="btn btn-outline-primary btn-block">
                    Back to gallery
                  </router-link>
                </div>

              </div>

              <router-link :to="{ name: 'account'}"
                           v-if="isPurchaseSuccessful(edition.edition, account)"
                           tag="button" class="btn btn-outline-primary btn-block">
                View account
              </router-link>

            </form>

            <p v-if="!account" class="text-center pt-2">
              Your account is locked!
            </p>

          </div>

          <div class="card-footer" v-if="!haveNotPurchasedEditionBefore(edition.edition)">
            <p class="text-center pt-2">
              It looks like you have already purchased this edition!
            </p>

            <router-link :to="{ name: 'account'}"
                         v-if="isPurchaseSuccessful(edition.edition, account)"
                         tag="button" class="btn btn-outline-primary btn-block">
              View account
            </router-link>
          </div>

          <div v-if="isPurchaseFailed(edition.edition, account)" class="card-footer">
            <div class="btn-group-vertical btn-block">
              <button type="button" v-on:click="retryPurchase" class="btn btn-outline-primary btn-block">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import _ from 'lodash';
  import AddressIcon from '../ui-controls/AddressIcon';
  import PurchaseState from '../ui-controls/PurchaseState';
  import PriceInEth from '../ui-controls/PriceInEth';
  import * as actions from '../../store/actions';
  import {PAGES} from '../../store/loadingPageState';
  import ClickableTransaction from "../ui-controls/ClickableTransaction";
  import ClickableAddress from "../ui-controls/ClickableAddress";
  import LoadingSpinner from "../ui-controls/LoadingSpinner";
  import RarityIndicator from "../ui-controls/RarityIndicatorV2";
  import HighResLabel from "../ui-controls/HighResLabelV2.vue";
  import MetadataAttributes from "../ui-controls/MetadataAttributesV2.vue";
  import TweetEditionButton from "../ui-controls/TweetEditionButton";
  import LoadingSection from "../ui-controls/LoadingSection";

  export default {
    name: 'completePurchaseV2',
    components: {
      LoadingSection,
      TweetEditionButton,
      MetadataAttributes,
      HighResLabel,
      RarityIndicator,
      ClickableTransaction,
      PurchaseState,
      AddressIcon,
      PriceInEth,
      LoadingSpinner,
      ClickableAddress
    },
    data() {
      return {
        PAGES: PAGES,
        confirm_terms: false
      };
    },
    computed: {
      ...mapState([
        'account'
      ]),
      ...mapGetters('purchaseV2', [
        'editionPurchaseState',
        'isPurchaseTriggered',
        'isPurchaseStarted',
        'isPurchaseSuccessful',
        'isPurchaseFailed',
        'getTransactionForEdition',
      ]),
      ...mapGetters('v2', [
        'haveNotPurchasedEditionBefore',
        'findEdition',
      ]),
      ...mapGetters('loading', [
        'isLoading'
      ]),
      ...mapGetters([
        'findArtistsForAddress'
      ]),
      title: function () {
        return `${this.$route.params.edition} - ID ${this.$route.params.tokenId}`;
      },
      edition: function () {
        return this.findEdition(this.$route.params.editionNumber);
      }
    },
    methods: {
      completePurchase: function () {
        this.$store.dispatch(`purchaseV2/${actions.PURCHASE_EDITION}`, {
          edition: this.edition,
          account: this.account
        });
      },
      retryPurchase: function () {
        this.$store.dispatch(`purchaseV2/${actions.RESET_PURCHASE_STATE}`, {
          edition: this.edition
        });
      },
      isNotSoldOut: function () {
        return this.edition.totalAvailable - this.edition.totalSupply > 0;
      }
    },
    mounted() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.COMPLETE_PURCHASE);

      const loadData = function () {
        this.$store.dispatch(`v2/${actions.LOAD_INDIVIDUAL_EDITION}`, {editionNumber: this.$route.params.editionNumber})
          .then(() => {
            return this.$store.dispatch(`v2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account: this.account});
          })
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.COMPLETE_PURCHASE);
          });
      }.bind(this);

      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        () => loadData());

      if (this.$store.state.KnownOriginDigitalAssetV2) {
        loadData();
      }

      // Dont' perform the no-web3 check immediately, allow the chain time to respond
      setTimeout(function () {
        if (!this.account) {
          this.$modal.show('no-web3-found');
        }
      }.bind(this), 10000);
    }
  };
</script>

<style scoped>
  li.no-bottom-border {
    border-bottom: 0 none;
  }

  li.no-top-border {
    border-top: 0 none;
  }

  .edition-data {
    font-size: 0.75rem;
  }

  .form-check {
    padding-left: 0;
  }
</style>
