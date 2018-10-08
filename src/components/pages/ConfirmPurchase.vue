<template>
  <div class="container-fluid mt-4">
    <div class="row editions-wrap">

      <loading-section v-if="!edition" :page="PAGES.CONFIRM_PURCHASE"></loading-section>

      <div class="col-sm-3 order-2 order-sm-1 mb-5">
        <div class="shadow-sm bg-white p-4">

          <router-link
            :to="{ name: 'artist-v2', params: { artistAccount: findArtistsForAddress(edition.artistAccount).ethAddress } }" class="artist-link">
            <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
            <span class="pl-1 artist-name-lg" v-on:click="goToArtist(edition.artistAccount)">{{ findArtistsForAddress(edition.artistAccount).name }}</span>
          </router-link>

          <div class="clearfix"></div>

          <hr/>

          <div>
            {{ edition.name }}
          </div>

          <div class="small">
            {{ edition.description }}
          </div>

          <hr/>

          <!--<small class="text-danger" v-if="isStartDateInTheFuture(edition.startDate)">-->
          <!--<span>Available {{ edition.startDate | moment('from') }}</span>-->
          <!--</small>-->

          <high-res-label :high-res-available="edition.highResAvailable"></high-res-label>

          <rarity-indicator :total-available="edition.totalAvailable"></rarity-indicator>

          <metadata-attributes :attributes="edition.attributes"></metadata-attributes>


          <div class="mt-4">
            <hr/>
            <price-in-eth :value="edition.priceInEther"></price-in-eth>
            <span class="pl-1"><u-s-d-price :price-in-ether="edition.priceInEther"></u-s-d-price></span>

            <div class="mt-2"
                 v-if="(edition.totalAvailable - edition.totalSupply > 0) && !isStartDateInTheFuture(edition.startDate) && haveNotPurchasedEditionBefore(edition.edition)">
              <a v-on:click="proceedWithPurchase" class="btn btn-primary text-white">Buy Now</a>
            </div>

            <div class="mt-2" v-if="(edition.totalAvailable - edition.totalSupply === 0)">
              Sold out
            </div>

            <div class="mt-2" v-if="!haveNotPurchasedEditionBefore(edition.edition)">
              <p class="text-center pt-2">
                It looks like you have already purchased this edition!
              </p>
              <router-link :to="{ name: 'account'}" tag="button" class="btn btn-outline-primary">
                View account
              </router-link>
            </div>

          </div>

          <div class="small">
            <hr/>
            Edition 1 of {{ edition.totalAvailable }}
            <availability class="float-right" :totalAvailable="edition.totalAvailable"
                          :totalSupply="edition.totalSupply"></availability>
          </div>

          <!--<hr/>-->

          <!--<div class="mt-2">-->
          <!--<h6>Activity</h6>-->
          <!--</div>-->
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
  import {mapGetters, mapState} from 'vuex';
  import _ from 'lodash';
  import * as actions from '../../store/actions';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import {PAGES} from '../../store/loadingPageState';
  import PriceInEth from '../ui-controls/generic/PriceInEth';
  import USDPrice from '../ui-controls/generic/USDPrice';
  import RarityIndicator from '../ui-controls/v2/RarityIndicator';
  import MetadataAttributes from '../ui-controls/v2/MetadataAttributes';
  import HighResLabel from '../ui-controls/generic/HighResLabel';
  import Availability from "../ui-controls/v2/Availability";

  export default {
    name: 'confirmPurchase',
    components: {
      Availability,
      LoadingSection,
      PriceInEth,
      USDPrice,
      RarityIndicator,
      MetadataAttributes,
      HighResLabel
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
        'haveNotPurchasedEditionBefore',
      ]),
      ...mapGetters([
        'findArtistsForAddress'
      ]),
      edition: function () {
        return this.findEdition(this.$route.params.editionNumber);
      },
      title: function () {
        return `${this.edition.editionName} #${this.edition.edition}`;
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
  a {
    text-decoration: none;
  }
</style>
