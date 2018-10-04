<template>
  <div v-if="edition && nextMinimumNewBid(edition.edition) && isEditionAuctionEnabled(edition.edition)">
    <div v-if="account">

      <fieldset :disabled="isLoading(PAGES.ARTIST_ACCEPTING_BID)">
        <form>

          <!-- When you are NOT the top bidder -->
          <div class="form-group row" v-if="!accountIsHighestBidder(edition.edition)">

            <div class="col-sm-12">
              <div class="input-group">
                <div class="input-group-prepend">
                  <div class="input-group-text">ETH</div>
                </div>
                <input type="number" class="form-control" id="makeBidValue" step="0.01" placeholder="0.1"
                       v-model="form.bid" :min="nextMinimumNewBid(edition.edition)">
              </div>
              <small class="form-text text-muted text-center">
                Next minimum bid: {{nextMinimumNewBid(edition.edition)}} ETH
              </small>
            </div>

            <div class="col-sm-12">
              <button class="btn btn-primary btn-block"
                      v-if="!accountIsHighestBidder(edition.edition)" v-on:click="placeBid"
                      :disabled="form.bid < nextMinimumNewBid(edition.edition)">
                Place Bid
              </button>
              <p></p>
            </div>
          </div>

          <!-- When you are top bidder -->
          <div class="form-group row" v-if="accountIsHighestBidder(edition.edition)">
            <div class="col-sm-12">
              <div class="input-group">
                <div class="input-group-prepend">
                  <div class="input-group-text">ETH</div>
                </div>
                <input type="number" class="form-control" id="increaseBidValue" step="0.01" placeholder="0.1"
                       v-model="form.bid" :min="minBidAmount">
              </div>
              <small class="form-text text-muted text-center">
                Minimum increase: {{minBidAmount}} ETH
              </small>
            </div>
            <div class="col-sm-12">
              <button class="btn btn-primary btn-block"
                      v-if="accountIsHighestBidder(edition.edition)" v-on:click="increaseBid"
                      :disabled="form.bid < minBidAmount">
                Increase Bid
              </button>
              <p></p>
            </div>
          </div>
        </form>
      </fieldset>

      <!-- Auction - Bid complete -->
      <div v-if="auction[edition.edition] && auction[edition.edition].highestBid !== '0'" class="text-center">
        <div v-if="!accountIsHighestBidder(edition.edition)">
          <span class="font-weight-light">Current highest</span>
          <clickable-address :eth-address="auction[edition.edition].highestBidder"></clickable-address>
          @
          <span class="font-weight-bold">
            <price-in-eth :value="auction[edition.edition].highestBid"></price-in-eth>
          </span>
        </div>
        <div v-if="accountIsHighestBidder(edition.edition)">
          <span class="text-success">
            You are the highest bidder <img src="../../../../static/GreenTick.svg" style="width: 15px"/>
          </span>
          <br/>
          <clickable-address :eth-address="auction[edition.edition].highestBidder"></clickable-address>
          @
          <span class="font-weight-bold">
            <price-in-eth :value="auction[edition.edition].highestBid"></price-in-eth>
          </span>
        </div>
      </div>

      <!-- Auction - Bid submitted -->
      <div class="text-sm-center">

        <div v-if="isAuctionTriggered(edition.edition)">
          <hr/>
          <span class="card-text mt-4">
            Your bid has been initiated.<br/>Please be patient. Blockchains need to be mined.
            <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
          </span>
          <small class="text-muted">
            <br/>
            <clickable-transaction
              :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
          </small>
        </div>

        <div v-if="isAuctionStarted(edition.edition)">
          <hr/>
          <span class="card-text mt-4">
           Your purchase is being confirmed...<font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
          </span>
          <small class="text-muted">
            <br/>
            <clickable-transaction
              :transaction="getTransactionForEdition(edition.edition, account)"></clickable-transaction>
          </small>
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

      <p class="text-muted text-center">
        The winning bid will receive the artwork and all other bids will be refunded automatically.
      </p>

      <p class="text-muted text-center">
        Got any questions, reach us on
        <a href="https://t.me/knownorigin_io" target="_blank" title="Telegram">telegram</a>
        or via <a href="mailto:hello@knownorigin.io" target="_blank" title="Mail">email</a>
      </p>
    </div>
    <p v-else class="text-center pt-2">
      Your account is locked!
    </p>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import _ from 'lodash';
  import * as actions from '../../../store/actions';
  import {PAGES} from "../../../store/loadingPageState";
  import ClickableAddress from "../generic/ClickableAddress";
  import PriceInEth from "../generic/PriceInEth";
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import ClickableTransaction from "../generic/ClickableTransaction";
  import LoadingSpinner from "../generic/LoadingSpinner";

  export default {
    name: 'artistAcceptingBids',
    components: {
      LoadingSpinner,
      ClickableTransaction,
      PriceInEth,
      ClickableAddress,
      FontAwesomeIcon
    },
    props: {
      edition: {
        type: Object
      }
    },
    data() {
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
    created() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ARTIST_ACCEPTING_BID);

      const loadData = () => {
        this.$store.dispatch(`auction/${actions.GET_AUCTION_DETAILS}`, this.edition)
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

  .hr-sm {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
</style>
