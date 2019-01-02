<template>
  <div class="container-fluid mt-4">
    <div class="row editions-wrap">

      <loading-section v-if="!edition" :page="PAGES.COMPLETE_PURCHASE"></loading-section>

      <div class="col-sm-3 order-2 order-sm-1 mb-5" v-if="edition">
        <edition-card :edition="edition"></edition-card>

        <div class="shadow-sm bg-white pt-0 pl-4 pr-4 pb-4">

          <EditionSoldOut :edition="edition">
          </EditionSoldOut>

          <PurchaseFlow :edition="edition"
                        v-on:retry-purchase="retryPurchase">
          </PurchaseFlow>

          <ConfirmTermsAndPurchase :edition="edition"
                                   v-on:purchase-triggered="completePurchase">
          </ConfirmTermsAndPurchase>

          <AccountNotFound></AccountNotFound>
        </div>
      </div>

      <div class="col-sm-6 order-1 order-sm-2 mb-5">
        <div class="card shadow-sm" v-if="edition">
          <edition-image class="card-img-top" :src="edition.lowResImg" :id="edition.edition"/>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import _ from 'lodash';
  import * as actions from '../../store/actions';
  import {PAGES} from '../../store/loadingPageState';
  import ConfirmTermsAndPurchase from "../ui-controls/purhcase/ConfirmTermsAndPurchase";
  import PurchaseFlow from "../ui-controls/purhcase/PurchaseFlow";
  import LoadingSection from "../ui-controls/generic/LoadingSection";
  import EditionCard from "../ui-controls/cards/EditionCard";
  import EditionImage from "../ui-controls/generic/EditionImage";
  import EditionSoldOut from "../ui-controls/purhcase/EditionSoldOut";
  import AccountNotFound from "../ui-controls/purhcase/AccountNotFound";

  export default {
    name: 'completePurchase',
    components: {
      AccountNotFound,
      EditionSoldOut,
      EditionImage,
      EditionCard,
      LoadingSection,
      PurchaseFlow,
      ConfirmTermsAndPurchase
    },
    data() {
      return {
        PAGES: PAGES,
        overrideAlreadyPurchased: false
      };
    },
    computed: {
      ...mapState([
        'account',
        'etherscanBase',
      ]),
      ...mapGetters('kodaV2', [
        'findEdition',
      ]),
      ...mapGetters('loading', [
        'isLoading'
      ]),
      edition() {
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
    },
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../ko-colours.scss';
  @import '../../ko-card-flex.scss';

</style>
