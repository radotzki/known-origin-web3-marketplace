<template>
  <div class="container-fluid mt-4">
    <div class="row editions-wrap">

      <loading-section v-if="!edition" :page="PAGES.COMPLETE_PURCHASE"></loading-section>

      <div class="col-sm-3 order-2 order-sm-1 mb-5" v-if="edition">
        <edition-card :edition="edition"></edition-card>
        <div class="shadow-sm bg-white pt-0 pl-4 pr-4 pb-4">
          <div class="small">
            <div class="text-center mb-2" v-if="isPurchaseTriggered(edition.edition, account)">
              <code class="mt-2">
                Your purchase has been initiated.<br/>
                Please be patient.
                <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
              </code>
              <hr/>
            </div>

            <div class="text-center mb-2" v-if="isPurchaseStarted(edition.edition, account)">
              <code class="mt-2">
                Your purchase is being confirmed...
                <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
              </code>
              <br/>
              <span class="text-muted">
                  <clickable-transaction
                    :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
                </span>
              <hr/>
            </div>

            <div class="text-center mb-2" v-if="isPurchaseSuccessful(edition.edition, account)">
              <img src="../../../static/GreenTick.svg" style="width: 50px"/>
              <p class="card-text text-success mt-2">Your purchase was successful!</p>
              <span class="text-muted">
                  <clickable-transaction
                    :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
                </span>
            </div>

            <div class="text-center mb-2" v-if="isPurchaseFailed(edition.edition, account)">
              <img src="../../../static/Failure.svg" style="width: 50px"/>
              <p class="card-text text-danger mt-2">Your purchase failed!</p>
              <button type="button" v-on:click="retryPurchase" class="btn btn-secondary">
                Retry
              </button>
            </div>
          </div>

          <div class=""
               v-if="account && (edition.totalAvailable - edition.totalSupply > 0) && !isStartDateInTheFuture(edition.startDate) && haveNotPurchasedEditionBefore(edition.edition) && !isPurchaseFailed(edition.edition, account)">
            <div v-if="edition || !editionPurchaseState(edition.edition)">

              <div class="form-check mb-2">
                <label class="form-check-label" :for="'confirm_terms'">
                  <input type="checkbox" :id="'confirm_terms'" v-model="confirm_terms">
                  <span class="pl-2 small">I agree with the KODA terms of service. <router-link :to="{ name: 'terms' }" target="_blank">Terms of Service</router-link></span>
                </label>
              </div>

              <button type="button" class="btn btn-success btn text-white"
                      :disabled="!confirm_terms || isPurchaseTriggered(edition.edition, account) || isPurchaseSuccessful(edition.edition, account)"
                      v-on:click="completePurchase"
                      v-if="isNotSoldOut || !isPurchaseSuccessful(edition.edition, account)">
                Confirm
              </button>

            </div>

            <div v-if="isPurchaseFailed(edition.edition, account)">

            </div>
          </div>

          <div class="mt-2 text-center" v-if="(edition.totalAvailable - edition.totalSupply === 0)">
            Sold out
          </div>

          <div class="mt-4 text-center text-success" v-if="!haveNotPurchasedEditionBefore(edition.edition)">
            You own this asset
          </div>

          <div class="mt-2 text-center" v-if="!account">
            <code>Your account is locked!</code>
          </div>

        </div>
      </div>

      <div class="col-sm-6 order-1 order-sm-2 mb-5">
        <div class="card shadow-sm" v-if="edition">
          <img class="card-img-top" :src="edition.lowResImg"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import _ from 'lodash';
  import AddressIcon from '../ui-controls/generic/AddressIcon';
  import PriceInEth from '../ui-controls/generic/PriceInEth';
  import * as actions from '../../store/actions';
  import { PAGES } from '../../store/loadingPageState';
  import ClickableTransaction from '../ui-controls/generic/ClickableTransaction';
  import ClickableAddress from '../ui-controls/generic/ClickableAddress';
  import LoadingSpinner from '../ui-controls/generic/LoadingSpinner';
  import RarityIndicator from '../ui-controls/v2/RarityIndicator';
  import HighResLabel from '../ui-controls/generic/HighResLabel.vue';
  import MetadataAttributes from '../ui-controls/v2/MetadataAttributes.vue';
  import TweetEditionButton from '../ui-controls/v2/TweetEditionButton';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import USDPrice from '../ui-controls/generic/USDPrice';
  import Availability from '../ui-controls/v2/Availability';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import EditionCard from '../ui-controls/cards/EditionCard';

  export default {
    name: 'completePurchase',
    components: {
      EditionCard,
      LoadingSection,
      TweetEditionButton,
      MetadataAttributes,
      HighResLabel,
      RarityIndicator,
      ClickableTransaction,
      AddressIcon,
      PriceInEth,
      LoadingSpinner,
      ClickableAddress,
      USDPrice,
      Availability,
      FontAwesomeIcon
    },
    data () {
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
        'isStartDateInTheFuture',
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
      },
      getArtistAddress: function (artist) {
        if (_.isArray(artist.ethAddress)) {
          return artist.ethAddress[0];
        }
        return artist.ethAddress;
      }
    },
    created () {
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
    destroyed () {
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
