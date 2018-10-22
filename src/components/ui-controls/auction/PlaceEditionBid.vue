<template>
  <div class="mt-4 shadow-sm bg-white p-4" v-if="edition && nextMinimumNewBid(edition.edition) && isEditionAuctionEnabled(edition.edition)">
    <div v-if="account">

      <h6>Make a bid</h6>

      <!-- Auction - Bid complete -->
      <div v-if="auction[edition.edition] && auction[edition.edition].highestBid !== '0'" class="">

        Highest bid:
        <div class="float-right">
          <price-in-eth :value="auction[edition.edition].highestBid" class=""></price-in-eth>
          <span class="pl-1"><u-s-d-price :price-in-ether="auction[edition.edition].highestBid"></u-s-d-price></span>
        </div>
        <!--<div v-if="!accountIsHighestBidder(edition.edition)" class="mt-2">-->


        <!--&lt;!&ndash;from <clickable-address :eth-address="auction[edition.edition].highestBidder"></clickable-address>&ndash;&gt;-->
        <!--</div>-->
        <div v-if="accountIsHighestBidder(edition.edition)" class="mt-2 text-success small text-center">
          <strong>Your bid is the highest!</strong>
          <!--<clickable-address :eth-address="auction[edition.edition].highestBidder"></clickable-address>-->
        </div>
      </div>

      <div class="clearfix"></div>
      <hr/>

      <fieldset :disabled="isLoading(PAGES.ARTIST_ACCEPTING_BID)">
        <form class="form-inline was-validated">

          <!-- When you are NOT the top bidder -->
          <div class="input-group" v-if="!accountIsHighestBidder(edition.edition)">
            <div class="input-group-prepend">
              <div class="input-group-text">ETH</div>
            </div>
            <input type="number"
                   v-bind:class="{'is-invalid': nextMinimumNewBid(edition.edition) > form.bid, 'is-valid': nextMinimumNewBid(edition.edition) < form.bid}"
                   class="form-control mr-sm-2" id="makeBidValue" step="0.01" :placeholder="nextMinimumNewBid(edition.edition)" v-model="form.bid" :min="nextMinimumNewBid(edition.edition)"/>
            <button class="btn btn-secondary"
                    v-if="!accountIsHighestBidder(edition.edition)" v-on:click="placeBid"
                    :disabled="form.bid < nextMinimumNewBid(edition.edition)">
              Make Bid
            </button>
            <div class="invalid-feedback" v-if="nextMinimumNewBid(edition.edition) > form.bid">Minimum bid: {{nextMinimumNewBid(edition.edition)}} ETH</div>
          </div>

          <!-- When you are top bidder -->
          <div class="input-group" v-if="accountIsHighestBidder(edition.edition)">
            <div class="input-group-prepend">
              <div class="input-group-text">ETH</div>
            </div>
            <input type="number" v-bind:class="{'is-invalid': nextMinimumNewBid(edition.edition) > form.bid, 'is-valid': nextMinimumNewBid(edition.edition) < form.bid}"
                   class="form-control is-invalid mr-sm-2" id="increaseBidValue" step="0.01" placeholder="0.1" v-model="form.bid" :min="minBidAmount">
            <button class="btn btn-secondary"
                    v-if="accountIsHighestBidder(edition.edition)" v-on:click="increaseBid"
                    :disabled="form.bid < minBidAmount">
              Make Bid
            </button>
            <div class="invalid-feedback" v-if="nextMinimumNewBid(edition.edition) > form.bid">
              Minimum increase: {{minBidAmount}} ETH
            </div>
          </div>
        </form>
      </fieldset>

      <!-- Auction - Bid submitted -->
      <div class="text-sm-center">

        <div v-if="isAuctionTriggered(edition.edition)">
          <hr/>
          <div class="mt-4">
            Your bid has been submitted.<br/>Please be patient. Blockchains need to be mined.
          </div>
          <div class="text-muted">
            <clickable-transaction :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
          </div>
        </div>

        <div v-if="isAuctionStarted(edition.edition)">
          <hr/>
          <div class="mt-4">
            Your bid is being confirmed.
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

      <!--<p class="text-muted text-center small">-->
      <!--Got any questions, reach us on-->
      <!--<a href="https://t.me/knownorigin_io" target="_blank" title="Telegram">telegram</a>-->
      <!--or via <a href="mailto:hello@knownorigin.io" target="_blank" title="Mail">email</a>-->
      <!--</p>-->
    </div>
    <p v-else class="text-center pt-2">
      Your account is locked!
    </p>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import _ from 'lodash';
  import * as actions from '../../../store/actions';
  import { PAGES } from '../../../store/loadingPageState';
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
    data () {
      return {
        PAGES: PAGES,
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
      placeBid: function (e) {
        e.preventDefault();
        if (this.form.bid) {
          this.$store.dispatch(`auction/${actions.PLACE_BID}`, {
            edition: this.edition.edition,
            value: this.form.bid,
          });
        }
      },
      increaseBid: function (e) {
        e.preventDefault();
        if (this.form.bid) {
          this.$store.dispatch(`auction/${actions.INCREASE_BID}`, {
            edition: this.edition.edition,
            value: this.form.bid,
          });
        }
      }
    },
    created () {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ARTIST_ACCEPTING_BID);

      const loadData = () => {
        this.$store.dispatch(`auction/${actions.GET_AUCTION_DETAILS}`, this.edition.edition)
          .then(() => {
            this.$nextTick(function () {
              this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.ARTIST_ACCEPTING_BID);
            });
          });
      };

      this.$store.watch(
        () => this.$store.state.ArtistAcceptingBids,
        () => loadData());

      if (this.$store.state.ArtistAcceptingBids) {
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
