<template>
  <div class="container-fluid mt-4">
    <loading-section v-if="!edition" :page="PAGES.CONFIRM_PURCHASE"></loading-section>

    <div class="row editions-wrap">

      <div class="col-sm-3 order-2 order-sm-1 mb-5" v-if="edition">

        <edition-card :edition="edition"></edition-card>

        <div class="shadow-sm bg-white pt-0 pl-4 pr-4 pb-4" style="min-height: 50px">

          <PurchaseFlow :edition="edition" v-on:retry-purchase="retryPurchase">
          </PurchaseFlow>

          <ConfirmTermsAndPurchase :edition="edition" v-on:purchase-triggered="completePurchase">
          </ConfirmTermsAndPurchase>

          <AccountNotFound></AccountNotFound>

        </div>

        <EditionSoldOut class="shadow-sm bg-white pt-0 pl-4 pr-4 pb-4"
                        :edition="edition">
        </EditionSoldOut>

        <div v-if="canProceedWithPurchase">
          <place-edition-bid :edition="edition"></place-edition-bid>
        </div>

        <auction-events-list :edition="edition"></auction-events-list>
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
  import PlaceEditionBid from "../ui-controls/auction/PlaceEditionBid";
  import AuctionEventsList from "../ui-controls/auction/AuctionEventsList";
  import LikeIconButton from "../ui-controls/likes/LikeIconButton";
  import PurchaseFlow from "../ui-controls/purhcase/PurchaseFlow";
  import LoadingSection from "../ui-controls/generic/LoadingSection";
  import EditionCard from "../ui-controls/cards/EditionCard";
  import EditionImage from "../ui-controls/generic/EditionImage";
  import EditionSoldOut from "../ui-controls/purhcase/EditionSoldOut";
  import AccountNotFound from "../ui-controls/purhcase/AccountNotFound";
  import ConfirmTermsAndPurchase from "../ui-controls/purhcase/ConfirmTermsAndPurchase";

  export default {
    name: 'confirmPurchase',
    components: {
      EditionSoldOut,
      LikeIconButton,
      EditionImage,
      EditionCard,
      AuctionEventsList,
      PlaceEditionBid,
      LoadingSection,
      PurchaseFlow,
      AccountNotFound,
      ConfirmTermsAndPurchase
    },
    metaInfo() {
      if (this.edition) {
        const content = this.edition.artist ? `${this.edition.name} by ${this.edition.artist.name}` : '';
        return {
          title: content,
          meta: [
            {property: 'title', content: content},
            {property: 'url', content: `https://dapp.knownorigin.io/edition/${this.edition.edition}`},
            {property: 'og:type', content: 'website'},
            {property: 'og:title', content: content},
            {property: 'og:url', content: `https://dapp.knownorigin.io/edition/${this.edition.edition}`},
            {property: 'og:image', content: this.edition.lowResImg},
            {property: 'og:description', content: this.edition.description},
            {name: 'twitter:card', content: 'summary_large_image'},
            {name: 'twitter:image', content: this.edition.lowResImg},
            {name: 'twitter:title', content: this.edition.name},
            {name: 'twitter:description', content: this.edition.description},
            {name: 'twitter:site', content: '@KnownOrigin_io'}
          ]
        };
      }
    },
    data() {
      return {
        PAGES: PAGES
      };
    },
    computed: {
      ...mapState([
        'account'
      ]),
      ...mapGetters('kodaV2', [
        'findEdition',
        'isStartDateInTheFuture'
      ]),
      edition() {
        return this.findEdition(this.$route.params.editionNumber);
      },
      canProceedWithPurchase() {
        const hasEditionLeftToPurchase = _.toNumber(this.edition.totalAvailable) - _.toNumber(this.edition.totalSupply) > 0;

        return hasEditionLeftToPurchase && !this.isStartDateInTheFuture(this.edition.startDate);
      },
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
          edition: this.edition,
          account: this.account
        });
      }
    },
    created() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.CONFIRM_PURCHASE);

      // Checks to see if refreshed and txs stuck in the flow
      this.$store.watch(
        () => this.$store.state.web3,
        () => {
          this.$store.dispatch(`purchase/${actions.CHECK_IN_FLIGHT_TRANSACTIONS}`, {
            edition: this.edition,
            account: this.account
          });
        }
      );

      /////////
      // API //
      /////////

      const loadApiData = () => {
        this.$store.dispatch(`kodaV2/${actions.LOAD_INDIVIDUAL_EDITION}`, {editionNumber: this.$route.params.editionNumber})
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.CONFIRM_PURCHASE);
          });
      };

      this.$store.watch(
        () => this.$store.state.editionLookupService.currentNetworkId,
        () => loadApiData()
      );

      if (this.$store.state.editionLookupService.currentNetworkId) {
        loadApiData();
      }

      //////////
      // WEB3 //
      //////////

      const loadContractData = () => {
        return this.$store.dispatch(`kodaV2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account: this.account});
      };

      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        () => loadContractData()
      );

      if (this.$store.state.KnownOriginDigitalAssetV2) {
        loadContractData();
      }
    },
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../ko-colours.scss';
  @import '../../ko-card-flex.scss';

  a {
    text-decoration: none;
  }

</style>
