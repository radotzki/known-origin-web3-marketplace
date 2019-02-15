<template>
  <div v-if="account
            && edition
            && isNotSoldOut
            && !isStartDateInTheFuture(edition.startDate)
            && !isPurchaseFailed(edition.edition, account)">

    <div v-if="showTermsAndConditions">

      <button type="button" class="btn btn-primary text-white"
              v-on:click="$emit('purchase-triggered')"
              :disabled="isPurchaseTriggered(edition.edition, account)"
              v-if="isNotSoldOut || !isPurchaseSuccessful(edition.edition, account)">
        Buy
      </button>

      <div class="small mt-3">
          <router-link :to="{ name: 'terms' }" target="_blank">Terms of Service</router-link>
      </div>

    </div>

    <!-- Purchased and show ability to re-buy -->
    <div class="pt-2 text-center small"
         v-if="!overrideAlreadyPurchased && alreadyPurchasedEdition(edition.edition)">

      <div class="">
        Looks like you already own this.<br/>
        To purchase another one <span class="btn-link pointer" v-on:click="overridePurchase">click here</span>
      </div>
    </div>

  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import * as actions from '../../../store/actions';

  export default {
    name: 'ConfirmTermsAndPurchase',
    components: {},
    props: {
      edition: {
        type: Object
      }
    },
    data () {
      return {
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
      isNotSoldOut () {
        return this.edition.totalAvailable - this.edition.totalSupply > 0;
      },
      showTermsAndConditions () {

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
      overridePurchase () {
        this.overrideAlreadyPurchased = true;
        this.$store.dispatch(`purchase/${actions.RESET_PURCHASE_STATE}`, {
          edition: this.edition,
          account: this.account
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


