<template>
  <div class="container-fluid d-none d-md-block"
       v-if="editions && account && !paused && anyOfTheEditionsAreOwnedByTheLoggedInAccount()">

    <div class="editions-wrap">
      <h3>Artist Controls
      </h3>
      <p>
        Control prices for your artworks and gift NFTs.
      </p>
      <p>
        Please check <a :href="etherscanBase" target="_blank">Etherscan</a> to confirm your transactions complete
        successfully.
      </p>
    </div>

    <div class="row col editions-wrap pb-4">
      <table class="table table-striped">
        <tbody>
        <tr v-for="edition, editionNumber in editions" :key="editionNumber" v-if="shouldShowControls(edition)">
          <td>
            <router-link :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: editionNumber }}">
              <img :src="edition.lowResImg" class="img-thumbnail" style="max-width: 100px" :id="editionNumber"/>
            </router-link>
          </td>
          <td class="d-none d-md-table-cell align-middle">
            <div>
              {{edition.name}}
            </div>
            <div class="text-muted small">
              <remaining-count :totalAvailable="edition.totalAvailable" :totalSupply="edition.totalSupply">
              </remaining-count>
            </div>
          </td>
          <td class="align-middle">
            <form class="form-inline">
              <div class="form-group mx-sm-3">
                <input type="text" class="form-control"
                       :id="'address_' + editionNumber" placeholder="0x123...."
                       v-model="form.gift[edition.edition]">
              </div>
              <button type="button" class="btn btn-primary"
                      :disabled="!isValidAddress(form.gift[edition.edition])"
                      @click="giftEdition(edition, form.gift[edition.edition])">Gift
              </button>
            </form>
            <view-transaction-details :transaction="form.giftTransactions[edition.edition]">
            </view-transaction-details>
          </td>
          <td class="align-middle">
            <form class="form-inline">
              <div class="form-group mx-sm-3">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <div class="input-group-text">ETH</div>
                  </div>
                  <input type="number" class="form-control" style="max-width: 100px;"
                         :id="'price_' + editionNumber"
                         placeholder="0.1" min="0" step="0.02"
                         v-model="form.price[edition.edition]">
                  <div class="input-group-append">
                    <div class="input-group-text">${{toUsdPrice(form.price[edition.edition])}}</div>
                  </div>
                </div>
              </div>
              <button type="button" class="btn btn-primary"
                      :disabled="!form.price[edition.edition] || form.price[edition.edition] < 0"
                      @click="updatePrice(edition, form.price[edition.edition])">Set Price
              </button>
            </form>
            <small class="text-muted pl-3">
              Currently {{edition.priceInEther}} ETH = $ {{toUsdPrice(edition.priceInEther)}}
            </small>
            <view-transaction-details :transaction="form.priceTransactions[edition.edition]">
            </view-transaction-details>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import ClickableAddress from '../generic/ClickableAddress';
  import PriceInEth from '../generic/PriceInEth';
  import ClickableTransaction from '../generic/ClickableTransaction';
  import ViewTransactionDetails from '../generic/ViewTransactionDetails';
  import * as actions from '../../../store/actions';
  import Web3 from 'web3';
  import _ from 'lodash';
  import Vue from 'vue';
  import RemainingCount from "../v2/RemainingCount";

  export default {
    name: 'artistEditionControls',
    components: {
      RemainingCount,
      ViewTransactionDetails,
      ClickableTransaction,
      PriceInEth,
      ClickableAddress,
    },
    props: ['editions'],
    data() {
      return {
        form: {
          price: {},
          priceTransactions: {},
          gift: {},
          giftTransactions: {},
        }
      };
    },
    computed: {
      ...mapState([
        'account',
        'etherscanBase',
        'currentUsdPrice',
      ]),
      ...mapState('artistControls', [
        'owner',
        'paused',
      ])
    },
    methods: {
      shouldShowControls: function (edition) {
        return (edition.totalAvailable - edition.totalSupply > 0) &&
          (this.account === edition.artistAccount || this.account === this.owner);
      },
      giftEdition: function (edition, receiver) {
        if (edition && receiver) {
          this.$store.dispatch(`artistControls/${actions.GIFT_EDITION}`, {edition, receiver})
            .then((txs) => {
              Vue.set(this.form.giftTransactions, edition.edition, _.get(txs, 'tx'));
            });
        }
      },
      updatePrice: function (edition, priceInEth) {
        if (priceInEth && edition) {
          this.$store.dispatch(`artistControls/${actions.UPDATE_EDITION_PRICE}`, {
            edition,
            value: Web3.utils.toWei(priceInEth)
          })
            .then((txs) => {
              Vue.set(this.form.priceTransactions, edition.edition, _.get(txs, 'tx'));
            });
        }
      },
      anyOfTheEditionsAreOwnedByTheLoggedInAccount() {
        // If logged in account is the smrat contract owner
        if (this.account === this.owner) {
          return true;
        }

        // Otherwise if any of the artworks are by the currently logged in user
        return _.find(this.editions, (edition) => {
          return edition.artistAccount === this.account;
        });
      },
      isValidAddress: function (address) {
        if (!address || address.length === 0) {
          return false;
        }
        return Web3.utils.isAddress(address);
      },
      toUsdPrice: function (priceInEther) {
        if (!priceInEther) {
          return '0';
        }
        return (priceInEther * this.currentUsdPrice).toFixed(2);
      }
    }
  };
</script>

<style scoped lang="scss">

</style>