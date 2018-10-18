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

            <p class="card-title"><strong>{{ edition.name }}</strong></p>
          </div>

          <ul class="list-group list-group-flush" v-if="isNotSoldOut() && account">
            <li class="list-group-item">
              <div class="d-inline-block">
                <high-res-label :high-res-available="edition.highResAvailable"></high-res-label>
                <rarity-indicator :total-available="edition.totalAvailable"></rarity-indicator>
                <metadata-attributes :attributes="edition.attributes"></metadata-attributes>
              </div>
            </li>
            <li class="list-group-item">
              <div class="d-inline-block"><img src="/../../static/Account_You_icn.svg" class="artist-avatar"/></div>
              <div class="d-inline-block">
                <small class="pl-2 text-muted">You:</small>
                <clickable-address :eth-address="account" class="small"></clickable-address>
              </div>
            </li>
            <li class="list-group-item">
              <div class="d-inline-block"><img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/></div>
              <div class="d-inline-block">
                <small class="pl-2 text-muted">Artist:</small>
                <span class="artist-name">{{ findArtistsForAddress(edition.artistAccount).name }}</span>
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
                    <span class="pl-2 small">I agree with the KODA terms of service</span>
                  </label>
                </div>

                <div v-if="isNotSoldOut" class="mb-2">
                  <small>
                    By choosing <strong>I agree</strong>, you understand and agree to KnownOrigin's term of service and
                    usage license.
                    <router-link :to="{ name: 'terms' }" target="_blank">Terms of Service</router-link>
                  </small>
                </div>

                <div class="btn-group-vertical btn-block">
                  <button type="button" class="btn btn-success btn-block text-white"
                          :disabled="!confirm_terms || isPurchaseTriggered(edition.edition, account) || isPurchaseSuccessful(edition.edition, account)"
                          v-on:click="completePurchase"
                          v-if="isNotSoldOut || !isPurchaseSuccessful(edition.edition, account)">
                    Confirm
                  </button>

                  <router-link :to="{ name: 'gallery'}" tag="button" class="btn btn-outline-primary btn-block">
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

          <div class="card-footer"
               v-if="!haveNotPurchasedEditionBefore(edition.edition) && !isPurchaseSuccessful(edition.edition, account)">
            <p class="text-center pt-2">
              You have already purchased this edition!
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
  import AddressIcon from '../ui-controls/generic/AddressIcon';
  import PriceInEth from '../ui-controls/generic/PriceInEth';
  import * as actions from '../../store/actions';
  import {PAGES} from '../../store/loadingPageState';
  import ClickableTransaction from "../ui-controls/generic/ClickableTransaction";
  import ClickableAddress from "../ui-controls/generic/ClickableAddress";
  import LoadingSpinner from "../ui-controls/generic/LoadingSpinner";
  import RarityIndicator from "../ui-controls/v2/RarityIndicator";
  import HighResLabel from "../ui-controls/generic/HighResLabel.vue";
  import MetadataAttributes from "../ui-controls/v2/MetadataAttributes.vue";
  import TweetEditionButton from "../ui-controls/v2/TweetEditionButton";
  import LoadingSection from "../ui-controls/generic/LoadingSection";

  export default {
    name: 'completePurchase',
    components: {
      LoadingSection,
      TweetEditionButton,
      MetadataAttributes,
      HighResLabel,
      RarityIndicator,
      ClickableTransaction,
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
      ...mapGetters('purchase', [
        'editionPurchaseState',
        'isPurchaseTriggered',
        'isPurchaseStarted',
        'isPurchaseSuccessful',
        'isPurchaseFailed',
        'getTransactionForEdition',
      ]),
      ...mapGetters('kodaV2', [
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
        this.$store.dispatch(`purchase/${actions.PURCHASE_EDITION}`, {
          edition: this.edition,
          account: this.account
        });
      },
      retryPurchase: function () {
        this.$store.dispatch(`purchase/${actions.RESET_PURCHASE_STATE}`, {
          edition: this.edition
        });
      },
      isNotSoldOut: function () {
        return this.edition.totalAvailable - this.edition.totalSupply > 0;
      }
    },
    created() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.COMPLETE_PURCHASE);

      const loadData = function () {
        this.$store.dispatch(`kodaV2/${actions.LOAD_INDIVIDUAL_EDITION}`, {editionNumber: this.$route.params.editionNumber})
          .then(() => {
            return this.$store.dispatch(`kodaV2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account: this.account});
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
    },
    destroyed() {
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
