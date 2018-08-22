<template>
  <div class="container">

    <div v-if="edition" class="row justify-content-sm-center">
      <div class="col col-sm-6">
        <div class="card shadow-sm">

          <img class="card-img-top" :src="edition.lowResImg"/>

          <div class="card-body">

            <div class="text-center mb-2" v-if="isPurchaseTriggered(edition.edition, account)">
              <loading-spinner></loading-spinner>
              <p class="card-text text-muted mt-4">Your purchase has been initiated</p>
              <p class="card-text text-muted mt-4">Please be patient. Blockchains need to be mined.</p>
            </div>

            <div class="text-center mb-2" v-if="isPurchaseStarted(edition.edition, account)">
              <loading-spinner></loading-spinner>
              <p class="card-text text-muted mt-4">Your purchase is being confirmed...</p>
              <small class="text-muted">
                <clickable-transaction
                  :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
              </small>
            </div>

            <div class="text-center mb-2" v-if="isPurchaseSuccessful(edition.edition, account)">
              <img src="../../../static/GreenTick.svg" style="width: 100px"/>
              <p class="card-text text-success mt-4">Your purchase was successful!</p>
              <small class="text-muted">
                <clickable-transaction
                  :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
              </small>
              <div class="mt-2">
                <tweet-edition-button :edition="edition"></tweet-edition-button>
              </div>
            </div>

            <div class="text-center mb-2" v-if="isPurchaseFailed(edition.edition, account)">
              <img src="../../../static/Failure.svg" style="width: 100px"/>
              <p class="card-text text-danger mt-4">Your purchase failed!</p>
            </div>

            <p class="card-text">

              <high-res-label :edition="edition"></high-res-label>

              <rarity-indicator :total-available="edition.totalAvailable"></rarity-indicator>

              <span class="badge badge-light">1 of {{ edition.totalAvailable }}</span>

              <metadata-attributes :other-meta="edition.otherMeta"></metadata-attributes>
            </p>

            <span>
              <h5 class="card-title">{{ edition.otherMeta.artworkName }}</h5>
              <h6 class="card-subtitle mb-2 text-muted">By <router-link
                :to="{ name: 'artist-v2', params: { artistAccount: edition.artistAccount} }">{{ edition.otherMeta.artist }}</router-link></h6>
            </span>
          </div>

          <ul class="list-group list-group-flush" v-if="isNotSoldOut() && account">
            <li class="list-group-item">
              <div class="d-inline-block"><img src="/../../static/Account_You_icn.svg" style="height: 50px"/></div>
              <div class="d-inline-block">
                <span class="pl-2 text-muted">You:</span>
                <clickable-address :eth-address="account"></clickable-address>
              </div>
            </li>
            <li class="list-group-item">
              <div class="d-inline-block"><img src="/../../static/ETH_icn.svg" style="height: 50px"/></div>
              <div class="d-inline-block">
                <span class="pl-2 text-muted">Amount:</span> <strong>{{ edition.priceInEther }} ETH</strong>
              </div>
            </li>
            <li class="list-group-item">
              <div class="d-inline-block"><img src="/../../static/Account_You_icn.svg" style="height: 50px"/></div>
              <div class="d-inline-block">
                <span class="pl-2 text-muted">Artists:</span>
                <clickable-address :eth-address="edition.artistAccount"></clickable-address>
              </div>
            </li>
            <li class="list-group-item text-right no-bottom-border">
              <price-in-eth :value="edition.priceInEther"></price-in-eth>
            </li>
          </ul>

          <div class="card-footer" v-if="!isPurchaseFailed(edition.edition, account)">
            <form v-if="account">

              <div v-if="edition">

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
                          v-on:click="completePurchase" v-if="isNotSoldOut">
                    Confirm buy
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
  import ClickableTransaction from "../ui-controls/ClickableTransaction";
  import ClickableAddress from "../ui-controls/ClickableAddress";
  import LoadingSpinner from "../ui-controls/LoadingSpinner";
  import RarityIndicator from "../ui-controls/RarityIndicatorV2";
  import HighResLabel from "../ui-controls/HighResLabelV2.vue";
  import MetadataAttributes from "../ui-controls/MetadataAttributesV2.vue";
  import TweetEditionButton from "../ui-controls/TweetEditionButton";

  export default {
    name: 'completePurchaseV2',
    components: {
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
        'findEdition',
      ]),
      accountAlreadyPurchasedEdition: function () {

      },
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
      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        (newValue, oldValue) => {
          if (newValue) {
            this.$store.dispatch(`v2/${actions.LOAD_INDIVIDUAL_EDITION}`, {editionNumber: this.$route.params.editionNumber});
          }
        });

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
</style>
