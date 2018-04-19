<template>
  <div>

    <loading-spinner v-if="!asset"></loading-spinner>

    <div v-else-if="asset" class="row justify-content-sm-center">
      <div class="col col-sm-6">
        <div class="card">

          <div class="card-body">

            <p class="card-text">
              <token-id :value="asset.id"></token-id>
            </p>

            <edition-name-by-artist :edition="asset"></edition-name-by-artist>
          </div>

          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              <div class="d-inline-block"><img src="/../../static/Account_You_icn.svg" style="height: 50px"/></div>
              <div class="d-inline-block">
                <span class="pl-4 pr-2 text-muted">You:</span><address-icon :eth-address="account" :size="'small'"></address-icon>
              </div>
            </li>
            <li class="list-group-item">
              <div class="d-inline-block"><img src="/../../static/ETH_icn.svg" style="height: 50px"/></div>
              <div class="d-inline-block">
                <span class="pl-4 pr-2 text-muted">Amount:</span>{{ asset.priceInEther }} ETH
              </div>
            </li>
            <li class="list-group-item">
              <div class="d-inline-block"><img src="/../../static/Account_You_icn.svg" style="height: 50px"/></div>
              <div class="d-inline-block">
                <span class="pl-4 pr-2 text-muted">Transfer to:</span><address-icon :eth-address="asset.owner" :size="'small'"></address-icon>
              </div>
            </li>
            <li class="list-group-item text-right">
              <price-in-eth :value="asset.priceInEther"></price-in-eth>
            </li>
          </ul>

          <div class="card-footer">
            <complete-purchase-button :asset="asset" class="pad-bottom" @purchaseInitiated="onPurchaseInitiated">
            </complete-purchase-button>
          </div>


          <!--<div class="border-box">-->
          <!--<div class="card-content">-->

          <!--<div v-if="isPurchaseTriggered(asset.id)" class="icon-message">-->
          <!--<img src="../../../static/Timer.svg" style="width: 100px"/>-->
          <!--<h2 class="text-blue pad-top">Your purchase is being initiated...</h2>-->
          <!--</div>-->

          <!--<div v-if="isPurchaseStarted(asset.id)" class="icon-message">-->
          <!--<img src="../../../static/Timer.svg" style="width: 100px"/>-->
          <!--<h2 class="text-blue pad-top">Your purchase is being confirmed...</h2>-->
          <!--<p>-->
          <!--<clickable-transaction :transaction="getTransactionForAsset(asset.id)"></clickable-transaction>-->
          <!--</p>-->
          <!--</div>-->

          <!--<div v-if="isPurchaseSuccessful(asset.id)" class="icon-message">-->
          <!--<img src="../../../static/GreenTick.svg" style="width: 100px"/>-->
          <!--<h2 class="text-success pad-top">Your purchase was successful!</h2>-->
          <!--<p>-->
          <!--<clickable-transaction :transaction="getTransactionForAsset(asset.id)"></clickable-transaction>-->
          <!--</p>-->
          <!--<div class="centered">-->
          <!--<tweet-purchase-button :asset-id="asset.id"></tweet-purchase-button>-->
          <!--</div>-->
          <!--</div>-->

          <!--<div v-if="isPurchaseFailed(asset.id)" class="icon-message">-->
          <!--<img src="../../../static/Failure.svg" style="width: 100px"/>-->
          <!--<h2 class="text-danger pad-top">Your purchase failed!</h2>-->
          <!--</div>-->

          <!--<h3>{{ asset.otherMeta.artworkName }}</h3>-->

          <!--<edition-name-by-artist :edition="asset" :purchase="true"></edition-name-by-artist>-->

          <!--<token-id :value="asset.id"></token-id>-->

          <!--<hr/>-->

          <!--<div v-if="!assetPurchaseState(asset.id)">-->

          <!--<div v-if="asset.purchased == 0" class="pad-top pad-bottom">-->
          <!--<table>-->
          <!--<tr>-->
          <!--<td width="25%"><img src="/../../static/Account_You_icn.svg" style="height: 50px"/></td>-->
          <!--<td width="75%">-->
          <!--You:<br/>-->
          <!--<address-icon :eth-address="account" :size="'small'"></address-icon>-->
          <!--</td>-->
          <!--</tr>-->
          <!--<tr>-->
          <!--<td width="25%"><img src="/../../static/DotDivider@x2.svg" style="height: 50px"/></td>-->
          <!--<td width="75%">-->
          <!--<hr/>-->
          <!--</td>-->
          <!--</tr>-->
          <!--<tr>-->
          <!--<td width="25%"><img src="/../../static/ETH_icn.svg" style="height: 50px"/></td>-->
          <!--<td width="75%">-->
          <!--Amount:<br/>-->
          <!--<strong>{{ asset.priceInEther }} ETH</strong>-->
          <!--</td>-->
          <!--</tr>-->
          <!--<tr>-->
          <!--<td width="25%"><img src="/../../static/DotDivider@x2.svg" style="height: 50px"/></td>-->
          <!--<td width="75%">-->
          <!--<hr/>-->
          <!--</td>-->
          <!--</tr>-->
          <!--<tr>-->
          <!--<td width="25%"><img src="/../../static/Account_You_icn.svg" style="height: 50px"/></td>-->
          <!--<td width="75%">-->
          <!--Transfer to:<br/>-->
          <!--<address-icon :eth-address="asset.owner" :size="'small'"></address-icon>-->
          <!--</td>-->
          <!--</tr>-->
          <!--</table>-->
          <!--</div>-->

          <!--<hr/>-->
          <!--</div>-->

          <!--<div><h3>Total ETH: <span class="pull-right ">{{ asset.priceInEther }}</span></h3></div>-->
          <!--</div>-->
          <!--</div>-->
          <!--<div class="border-box-buttons">-->
          <!--<div v-if="isPurchaseFailed(asset.id)" class="pad-bottom">-->
          <!--<button type="button" v-on:click="retryPurchase" class="btn btn-link">-->
          <!--Retry-->
          <!--</button>-->
          <!--</div>-->

          <!--<complete-purchase-button :asset="asset" class="pad-bottom" @purchaseInitiated="onPurchaseInitiated">-->
          <!--</complete-purchase-button>-->
          <!--</div>-->
          <!--</div>-->
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import Artist from '../Artist';
  import Asset from '../Asset';
  import CompletePurchaseButton from '../ui-controls/CompletePurchaseButton';
  import _ from 'lodash';
  import AddressIcon from '../ui-controls/AddressIcon';
  import PurchaseState from '../ui-controls/PurchaseState';
  import AssetFigure from '../AssetFigure';
  import PriceInEth from '../ui-controls/PriceInEth';
  import TokenId from '../ui-controls/TokenId.vue';
  import EditionNameByArtist from '../ui-controls/EditionNameByArtist';
  import * as mutations from '../../store/mutation-types';
  import { KnownOriginDigitalAsset } from '../../contracts/index';
  import * as actions from '../../store/actions';
  import ClickableTransaction from "../ui-controls/ClickableTransaction.vue";
  import TweetPurchaseButton from "../ui-controls/TweetPurchaseButton.vue";

  export default {
    name: 'completePurchase',
    components: {
      TweetPurchaseButton,
      ClickableTransaction,
      PurchaseState,
      Asset,
      AddressIcon,
      CompletePurchaseButton,
      PriceInEth,
      AssetFigure,
      EditionNameByArtist,
      TokenId
    },
    data () {
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
    }
  };
</script>

<style scoped>

</style>
