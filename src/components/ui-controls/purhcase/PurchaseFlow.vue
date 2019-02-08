<template>

  <div class="small">

    <!-- Triggered -->
    <div class="text-center mb-2" v-if="isPurchaseTriggered(edition.edition, account)">
      <code class="mt-2">
        Your purchase has been initiated.<br/>
        Please be patient.
        <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
      </code>
    </div>

    <!-- Started -->
    <div class="text-center mb-2" v-if="isPurchaseStarted(edition.edition, account)">
      <code class="mt-2">
        Your purchase is being confirmed...
        <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
      </code>
      <br/>
      <span class="text-muted mt-3">
        <clickable-transaction :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
      </span>
      <hr/>
    </div>

    <!-- Success -->
    <div class="text-center mb-2" v-if="isPurchaseSuccessful(edition.edition, account)">
      <img src="../../../../static/GreenTick.svg" style="width: 50px" alt="txs-sucess"/>
      <p class="card-text text-success mt-2">Your purchase was successful!</p>
      <span class="text-muted mt-3">
        <clickable-transaction :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
      </span>
    </div>

    <!-- Failure/Unknown -->
    <div class="text-center mb-2" v-if="isPurchaseFailed(edition.edition, account)">

      <font-awesome-icon :icon="['fas', 'info-circle']" class="text-info" size="6x">
      </font-awesome-icon>

      <p class="card-text text-info mt-2 mb-2">
        It looks like the purchase didn't complete successfully.
      </p>

      <p>
        Please check your <a :href="etherscanAccountPage" target="_blank">account</a>
        <span v-if="getTransactionForEdition(edition.edition, account)">
          and view the transaction <view-transaction-details :transaction="getTransactionForEdition(edition.edition, account)"></view-transaction-details>
        </span>
        before trying again.
      </p>

      <!-- Retry - emit event to parent to handle this action -->
      <p>Click below to retry</p>
      <button type="button" v-on:click="$emit('retry-purchase')" class="btn btn-secondary">
        Retry
      </button>

    </div>
  </div>

</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import ClickableTransaction from "../generic/ClickableTransaction";
  import ViewTransactionDetails from "../generic/ViewTransactionDetails";
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    name: 'PurchaseFlow',
    components: {
      ViewTransactionDetails,
      ClickableTransaction,
      FontAwesomeIcon
    },
    props: {
      edition: {
        type: Object
      }
    },
    data() {
      return {
        confirm_terms: false
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
      ...mapGetters('purchase', [
        'editionPurchaseState',
        'isPurchaseTriggered',
        'isPurchaseStarted',
        'isPurchaseSuccessful',
        'isPurchaseFailed',
        'getTransactionForEdition',
      ]),
      etherscanAccountPage() {
        return `${this.etherscanBase}/address/${this.account}`;
      }
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card-flex.scss';

</style>


