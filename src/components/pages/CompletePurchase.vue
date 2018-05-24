<template>
  <div class="container">

    <loading-spinner v-if="!asset"></loading-spinner>

    <div class="row justify-content-sm-center" v-if="!asset">
      <div class="col text-center mt-5">
        <p>We are loading assets from the Blockchain.</p>
        <p>Please be patient as we are fully decentralised.</p>
      </div>
    </div>

    <div v-else-if="asset" class="row justify-content-sm-center">
      <div class="col col-sm-6">
        <div class="card shadow-sm">

          <img class="card-img-top" :src="asset.lowResImg"/>

          <div class="card-body">

            <div class="text-center mb-2" v-if="isPurchaseTriggered(asset.id)">
              <loading-spinner></loading-spinner>
              <p class="card-text text-muted mt-4">Your purchase has been initiated</p>
              <p class="card-text text-muted mt-4">Please be patient. Blockchains need to be mined.</p>
            </div>

            <div class="text-center mb-2" v-if="isPurchaseStarted(asset.id)">
              <loading-spinner></loading-spinner>
              <p class="card-text text-muted mt-4">Your purchase is being confirmed...</p>
              <small class="text-muted">
                <clickable-transaction :transaction="getTransactionForAsset(asset.id)"></clickable-transaction>
              </small>
            </div>

            <div class="text-center mb-2" v-if="isPurchaseSuccessful(asset.id)">
              <img src="../../../static/GreenTick.svg" style="width: 100px"/>
              <p class="card-text text-success mt-4">Your purchase was successful!</p>
              <small class="text-muted">
                <clickable-transaction :transaction="getTransactionForAsset(asset.id)"></clickable-transaction>
              </small>
              <div class="mt-2">
                <tweet-purchase-button :asset-id="asset.id"></tweet-purchase-button>
              </div>
            </div>

            <div class="text-center mb-2" v-if="isPurchaseFailed(asset.id)">
              <img src="../../../static/Failure.svg" style="width: 100px"/>
              <p class="card-text text-danger mt-4">Your purchase failed!</p>
            </div>

            <p class="card-text">
              <token-id :value="asset.id"></token-id>

              <high-res-label :asset="asset"></high-res-label>

              <rarity-indicator :assets-in-edition="assetsForEdition(asset.edition)"></rarity-indicator>

              <span class="badge badge-light">1 of {{ assetsForEdition(asset.edition).length }}</span>

              <metadata-attributes :attributes="asset.attributes"></metadata-attributes>
            </p>

            <edition-name-by-artist :edition="asset"></edition-name-by-artist>
          </div>

          <ul class="list-group list-group-flush" v-if="!assetPurchaseState(asset.id)">
            <li class="list-group-item">
              <div class="d-inline-block"><img src="/../../static/Account_You_icn.svg" style="height: 50px"/></div>
              <div class="d-inline-block">
                <span class="pl-2 text-muted">You:</span>
                <clickable-address :eth-address="account"></clickable-address>
              </div>
            </li>
            <li class="list-group-item">
              <div class="d-inline-block"><img src="/../../static/ETH_icn.svg" style="height: 50px"/></div>
              <div class="d-inline-block">
                <span class="pl-2 text-muted">Amount:</span> <strong>{{ asset.priceInEther }} ETH</strong>
              </div>
            </li>
            <li class="list-group-item">
              <div class="d-inline-block"><img src="/../../static/Account_You_icn.svg" style="height: 50px"/></div>
              <div class="d-inline-block">
                <span class="pl-2 text-muted">To:</span>
                <clickable-address :eth-address="asset.owner"></clickable-address>
              </div>
            </li>
            <li class="list-group-item text-right no-bottom-border">
              <price-in-eth :value="asset.priceInEther"></price-in-eth>
            </li>
          </ul>

          <div class="card-footer" v-if="!isPurchaseFailed(asset.id)">
            <complete-purchase-button :asset="asset" class="pad-bottom"
                                      @purchaseInitiated="onPurchaseInitiated"></complete-purchase-button>
          </div>

          <div v-if="isPurchaseFailed(asset.id)" class="card-footer">
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
  import Artist from '../Artist';
  import Asset from '../Asset';
  import CompletePurchaseButton from '../ui-controls/CompletePurchaseButton';
  import _ from 'lodash';
  import AddressIcon from '../ui-controls/AddressIcon';
  import PurchaseState from '../ui-controls/PurchaseState';
  import PriceInEth from '../ui-controls/PriceInEth';
  import TokenId from '../ui-controls/TokenId.vue';
  import EditionNameByArtist from '../ui-controls/EditionNameByArtist';
  import * as mutations from '../../store/mutation-types';
  import * as actions from '../../store/actions';
  import ClickableTransaction from "../ui-controls/ClickableTransaction";
  import ClickableAddress from "../ui-controls/ClickableAddress";
  import TweetPurchaseButton from "../ui-controls/TweetPurchasedAssetButton";
  import LoadingSpinner from "../ui-controls/LoadingSpinner";
  import RarityIndicator from "../ui-controls/RarityIndicator";
  import HighResLabel from "../ui-controls/HighResLabel.vue";
  import MetadataAttributes from "../ui-controls/MetadataAttributes.vue";

  export default {
    name: 'completePurchase',
    components: {
      MetadataAttributes,
      HighResLabel,
      RarityIndicator,
      TweetPurchaseButton,
      ClickableTransaction,
      PurchaseState,
      Asset,
      AddressIcon,
      CompletePurchaseButton,
      PriceInEth,
      EditionNameByArtist,
      TokenId,
      LoadingSpinner,
      ClickableAddress
    },
    data() {
      return {
        confirm_terms: false
      };
    },
    computed: {
      ...mapGetters([
        'assetsForEdition',
        'firstAssetForEdition',
        'isKnownOrigin',
        'assetPurchaseState',
        'isPurchaseTriggered',
        'isPurchaseStarted',
        'isPurchaseSuccessful',
        'isPurchaseFailed',
        'getTransactionForAsset',
      ]),
      ...mapState([
        'account'
      ]),
      title: function () {
        return `${this.$route.params.edition} - ID ${this.$route.params.tokenId}`;
      },
      asset: function () {
        return this.$store.getters.assetById(this.$route.params.tokenId);
      },
      soldAsFiat: function () {
        return this.asset.purchased === 2;
      }
    },
    methods: {
      onPurchaseInitiated: function () {
        console.log('onPurchaseInitiated');
      },
      retryPurchase: function () {
        this.$store.dispatch(actions.RESET_PURCHASE_STATE, this.asset);
      }
    },
    mounted() {
      // Dont' perform the no-web3 check immediately, allow the chain time to respond
      setTimeout(function () {
        if (!this.account) {
          this.$modal.show('no-web3-found');
        }
      }.bind(this), 5000);
    }
  };
</script>

<style scoped>
  li.no-bottom-border {
    border-bottom: 0 none;
  }
</style>
