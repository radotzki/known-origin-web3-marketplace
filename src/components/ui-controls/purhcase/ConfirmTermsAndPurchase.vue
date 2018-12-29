<template>
  <div v-if="account
            && edition
            && isNotSoldOut
            && !isStartDateInTheFuture(edition.startDate)
            && !isPurchaseFailed(edition.edition, account)">

    <div v-if="showTermsAndConditions">

      <div class="form-check mb-2">
        <label class="form-check-label" for="confirm_terms_label">
          <input type="checkbox" id="confirm_terms_label"
                 v-model="confirm_terms"
                 v-on:click="$emit('terms-accepted')">
          <span class="pl-1 small">
            I agree with the KODA <router-link :to="{ name: 'terms' }" target="_blank">terms of service</router-link>
          </span>
        </label>
      </div>

      <button type="button" class="btn btn-success text-white mt-2"
              v-on:click="$emit('purchase-triggered')"
              :disabled="!confirm_terms || isPurchaseTriggered(edition.edition, account)"
              v-if="isNotSoldOut || !isPurchaseSuccessful(edition.edition, account)">
        Confirm
      </button>

    </div>

    <!-- Purchased and show ability to re-buy -->
    <div class="mt-2 pt-4 text-center small"
         v-if="!overrideAlreadyPurchased && alreadyPurchasedEdition(edition.edition)">

      <div class="text-success">
        Looks like you already own this
      </div>

      <p class="text-muted pt-2">
        To purchase another one <span class="btn-link pointer" v-on:click="overridePurchase">click here</span>
      </p>

    </div>

  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import * as actions from '../../../store/actions';

  export default {
    name: 'ConfirmTermsAndPurchase',
    components: {},
    props: {
      edition: {
        type: Object
      }
    },
    data() {
      return {
        confirm_terms: false,
        overrideAlreadyPurchased: false
      };
    },
    computed: {
      ...mapState([
        'account',
        'etherscanBase',
      ]),
      ...mapGetters('kodaV2', [
        'alreadyPurchasedEdition',
        'isStartDateInTheFuture',
      ]),
      ...mapState('purchase', [
        'purchaseState'
      ]),
      ...mapGetters('purchase', [
        'editionPurchaseState',
        'isPurchaseTriggered',
        'isPurchaseStarted',
        'isPurchaseSuccessful',
        'isPurchaseFailed',
      ]),
      isNotSoldOut() {
        return this.edition.totalAvailable - this.edition.totalSupply > 0;
      },
      showTermsAndConditions() {

        // If purchase inflight or finished, dont show
        if (this.isPurchaseTriggered(this.edition.edition, this.account) ||
          this.isPurchaseSuccessful(this.edition.edition, this.account) ||
          this.isPurchaseStarted(this.edition.edition, this.account)) {
          return false;
        }

        // Override and force show T&Cs with purchase button
        if (this.overrideAlreadyPurchased) {
          return true;
        }

        // By default is already purchased dont show T&Cs and purchase button
        if (this.alreadyPurchasedEdition(this.edition.edition)) {
          return false;
        }

        // By default show if unless the purchase flow is in flight
        return !this.editionPurchaseState(this.edition.edition);
      }
    },
    methods: {
      overridePurchase() {
        this.overrideAlreadyPurchased = true;
        this.$store.dispatch(`purchase/${actions.RESET_PURCHASE_STATE}`, {
          edition: this.edition
        });
      }
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card-flex.scss';

  .form-check {
    padding-left: 0;
  }

  .pointer {
    cursor: pointer;
  }
</style>


