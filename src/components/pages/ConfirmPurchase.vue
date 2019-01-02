<template>
  <div class="container-fluid mt-4">
    <div class="row editions-wrap">

      <loading-section v-if="!edition" :page="PAGES.CONFIRM_PURCHASE"></loading-section>

      <div class="col-sm-3 order-2 order-sm-1 mb-5" v-if="edition">

        <edition-card :edition="edition"></edition-card>

        <div class="shadow-sm bg-white pt-0 pl-4 pr-4 pb-4">

          <a v-on:click="proceedWithPurchase" class="btn btn-primary text-white">Buy Now</a>

          <EditionSoldOut :edition="edition"></EditionSoldOut>
        </div>

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
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import {PAGES} from '../../store/loadingPageState';
  import PlaceEditionBid from "../ui-controls/auction/PlaceEditionBid";
  import AuctionEventsList from "../ui-controls/auction/AuctionEventsList";
  import EditionCard from '../ui-controls/cards/EditionCard';
  import EditionImage from "../ui-controls/generic/EditionImage";
  import EditionSoldOut from "../ui-controls/purhcase/EditionSoldOut";

  export default {
    name: 'confirmPurchase',
    components: {
      EditionSoldOut,
      EditionImage,
      EditionCard,
      AuctionEventsList,
      PlaceEditionBid,
      LoadingSection,
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
        'isStartDateInTheFuture',
        'alreadyPurchasedEdition',
      ]),
      edition() {
        return this.findEdition(this.$route.params.editionNumber);
      },
      canProceedWithPurchase() {
        const hasEditionLeftToPurchase = this.edition.totalAvailable - this.edition.totalSupply > 0;

        return hasEditionLeftToPurchase &&
          !this.isStartDateInTheFuture(this.edition.startDate) &&
          !this.alreadyPurchased;
      },
      alreadyPurchased() {
        return this.alreadyPurchasedEdition(this.edition.edition);
      },
    },
    methods: {
      proceedWithPurchase: function () {
        this.$router.push({
          name: 'completePurchase',
          params: {
            artistAccount: this.edition.artistAccount,
            editionNumber: this.edition.edition
          }
        });
      },
      goToArtist: function (artistAccount) {
        this.$router.push({name: 'artist-v2', params: {artistAccount}});
      },
      getArtistAddress: function (artist) {
        if (_.isArray(artist.ethAddress)) {
          return artist.ethAddress[0];
        }
        return artist.ethAddress;
      }
    },
    created() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.CONFIRM_PURCHASE);

      const loadData = function () {
        this.$store.dispatch(`kodaV2/${actions.LOAD_INDIVIDUAL_EDITION}`, {editionNumber: this.$route.params.editionNumber})
          .then(() => {
            return this.$store.dispatch(`kodaV2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account: this.account});
          })
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.CONFIRM_PURCHASE);
          });
      }.bind(this);

      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        () => loadData()
      );

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

  a {
    text-decoration: none;
  }

</style>
