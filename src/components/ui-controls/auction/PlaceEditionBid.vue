<template>
  <div class="mt-4 shadow-sm bg-white p-4"
       v-if="edition && nextMinimumNewBid(edition.edition) && isEditionAuctionEnabled(edition.edition)">
    <div v-if="account">

      <h6>Make a bid</h6>

      <!-- Auction - Bid complete -->
      <div v-if="auction[edition.edition] && auction[edition.edition].highestBid !== '0'" class="">

        Highest bid:
        <div class="float-right">
          <price-in-eth :value="auction[edition.edition].highestBid" class=""></price-in-eth>
          <span class="pl-1"><u-s-d-price :price-in-ether="auction[edition.edition].highestBid"></u-s-d-price></span>
        </div>
        <div v-if="accountIsHighestBidder(edition.edition)" class="mt-2 text-center text-success">
          <strong>Your bid is the highest!</strong>
        </div>
      </div>

      <div class="clearfix"></div>
      <hr/>

      <fieldset>
        <form class="form-inline">

          <!-- When you are NOT the top bidder -->
          <div class="input-group" v-if="!accountIsHighestBidder(edition.edition)">

            <div class="input-group-prepend">
              <div class="input-group-text">ETH</div>
            </div>

            <input type="number"
                   class="form-control mr-sm-2" id="makeBidValue"
                   :step="minBidAmount"
                   :min="nextMinimumNewBid(edition.edition)"
                   v-model="form.bid"
                   :placeholder="nextMinimumNewBid(edition.edition)"/>
          </div>

          <button class="btn btn-secondary mt-2"
                  v-if="!accountIsHighestBidder(edition.edition)" v-on:click="placeBid"
                  :disabled="form.bid < nextMinimumNewBid(edition.edition)">
            Make Bid
          </button>

          <!-- When you are top bidder -->
          <div class="input-group" v-if="accountIsHighestBidder(edition.edition)">

            <div class="input-group-prepend">
              <div class="input-group-text">ETH</div>
            </div>

            <input type="number"
                   class="form-control" id="increaseBidValue"
                   :step="minBidAmount"
                   :min="nextMinimumNewBid(edition.edition)"
                   v-model="form.bid"
                   :placeholder="nextMinimumNewBid(edition.edition)"/>
          </div>

          <button class="btn btn-secondary mt-2"
                  v-if="accountIsHighestBidder(edition.edition)" v-on:click="increaseBid"
                  :disabled="form.bid < minBidAmount">
            Increase Bid
          </button>
        </form>
      </fieldset>

      <!-- Auction - Bid submitted -->
      <div class="text-sm-center">

        <div v-if="isAuctionTriggered(edition.edition)">
          <hr/>
          <div class="mt-4">
            Your bid has been submitted.<br/>Please be patient. Blockchains need to be mined.
            <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
          </div>
          <div class="text-muted">
            <clickable-transaction
              :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
          </div>
        </div>

        <div v-if="isAuctionStarted(edition.edition)">
          <hr/>
          <div class="mt-4">
            Your bid is being confirmed.
            <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
          </div>
          <div class="text-muted">
            <clickable-transaction
              :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
          </div>
        </div>

        <div class="text-center mb-2" v-if="isAuctionSuccessful(edition.edition, account)">
          <hr/>
          <small class="text-muted">
            <clickable-transaction
              :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
          </small>
        </div>

        <div v-if="isAuctionFailed(edition.edition)">
          <hr/>
          <span class="card-text text-danger mt-4">Your bid failed!</span>
          <img src="../../../../static/Failure.svg" style="width: 25px"/>
        </div>
      </div>

      <hr/>

      <p class="text-muted auction-info">
        If accepted, the highest bid will purchase the artwork. Other bids are refunded automatically.
      </p>

      <p class="text-muted auction-info">
        Questions? Reach us on
        <a href="https://t.me/knownorigin_io" target="_blank" title="Telegram">telegram</a>
        or <a href="mailto:hello@knownorigin.io" target="_blank" title="Mail">email</a>
      </p>
    </div>
    <p v-else class="text-center pt-2">
      Bidding not available - check your account is unlocked!
    </p>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import _ from 'lodash';
  import * as actions from '../../../store/actions';
  import {PAGES} from '../../../store/loadingPageState';
  import ClickableAddress from '../generic/ClickableAddress';
  import PriceInEth from '../generic/PriceInEth';
  import USDPrice from '../generic/USDPrice';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import ClickableTransaction from '../generic/ClickableTransaction';
  import LoadingSpinner from '../generic/LoadingSpinner';

  export default {
    name: 'placeEditionBid',
    components: {
      LoadingSpinner,
      ClickableTransaction,
      PriceInEth,
      ClickableAddress,
      FontAwesomeIcon,
      USDPrice
    },
    props: {
      edition: {
        type: Object
      }
    },
    data() {
      return {
        form: {
          bid: null
        }
      };
    },
    computed: {
      ...mapState([
        'account',
      ]),
      ...mapGetters('auction', [
        'accountIsHighestBidder',
        'isEditionAuctionEnabled',
        'nextMinimumNewBid',
        'isAuctionTriggered',
        'isAuctionStarted',
        'isAuctionSuccessful',
        'isAuctionFailed',
        'getTransactionForEdition',
      ]),
      ...mapState('auction', [
        'auction',
        'bidState',
        'minBidAmount',
        'minBidAmountWei',
      ]),
      ...mapGetters('loading', [
        'isLoading'
      ]),
    },
    methods: {
      placeBid(e) {
        e.preventDefault();
        if (this.form.bid) {
          this.$ga.event('purchase-flow', 'auction', 'place-bid');
          this.$store.dispatch(`auction/${actions.PLACE_BID}`, {
            edition: this.edition.edition,
            value: this.form.bid,
          });
        }
      },
      increaseBid(e) {
        e.preventDefault();
        if (this.form.bid) {
          this.$ga.event('purchase-flow', 'auction', 'increase-bid');
          this.$store.dispatch(`auction/${actions.INCREASE_BID}`, {
            edition: this.edition.edition,
            value: this.form.bid,
          });
        }
      }
    },
    created() {
      const loadData = () => {
        this.$store.dispatch(`auction/${actions.GET_AUCTION_DETAILS}`, this.edition.edition);
      };

      this.$store.watch(
        () => this.$store.state.auctionsService.currentNetworkId,
        () => loadData()
      );

      if (this.$store.state.auctionsService.currentNetworkId) {
        loadData();
      }

    },
  };
</script>

<style scoped lang="scss">

  .auction-info {
    font-size: 0.75rem;
  }
</style>
