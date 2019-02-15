<template>
  <div v-if="account
            && edition
            && isNotSoldOut
            && !isStartDateInTheFuture(edition.startDate)
            && !isPurchaseFailed(edition.edition, account)">

    <div v-if="showTermsAndConditions">

      <button type="button" class="btn btn-primary text-white btn-block"
              v-on:click="$emit('purchase-triggered')"
              :disabled="isPurchaseTriggered(edition.edition, account)"
              v-if="isNotSoldOut || !isPurchaseSuccessful(edition.edition, account)">
        <font-awesome-icon :icon="['fab', 'ethereum']"></font-awesome-icon> Buy Now (ETH)
      </button>

      <buy-edition-nifty-gateway class="mt-3" :edition="edition">
      </buy-edition-nifty-gateway>

      <hr />

      <div class="small mt-1">
          KnownOrigin <router-link :to="{ name: 'terms' }" target="_blank">Terms of Service</router-link>
      </div>
      <div class="small mt-1">
        Nifty Gateway <a href="https://niftygateway.com/#/terms" target="_blank">Terms of Service</a>
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
  import BuyEditionNiftyGateway from "./BuyEditionNiftyGateway";
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    name: 'ConfirmTermsAndPurchase',
    components: {
      BuyEditionNiftyGateway,
      FontAwesomeIcon
    },
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

  .btn {
    font-size: 14px;
  }
</style>


