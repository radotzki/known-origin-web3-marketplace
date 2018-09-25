<template>
  <div v-if="edition && editionMinimumBid(edition.edition)">
    <div class="card-footer text-center">
      <div>
        <form class="form-inline">
          <div class="form-group row align-top">
            <label for="bidValue" class="col-sm-3 col-form-label">
              Make a bid
            </label>
            <div class="col-sm-5">
              <div class="input-group">
                <div class="input-group-prepend">
                  <div class="input-group-text">ETH</div>
                </div>
                <input type="number" class="form-control" id="bidValue"
                       step="0.01" placeholder="0.1"
                       v-model="form.bid"
                       :min="editionMinimumBid(edition.edition)">
              </div>
              <small class="form-text text-muted">
                Next minimum bid: {{editionMinimumBid(edition.edition)}} ETH
              </small>
            </div>
            <div class="col-sm-3">
              <button class="btn btn-primary"
                      v-if="!accountIsHighestBidder(edition.edition)"
                      v-on:click="placeBid"
                      :disabled="form.bid < editionMinimumBid(edition.edition)">
                Place Bid
              </button>
              <button class="btn btn-primary"
                      v-if="accountIsHighestBidder(edition.edition)"
                      v-on:click="increaseBid"
                      :disabled="form.bid < editionMinimumBid(edition.edition)">
                Increase Bid
              </button>
            </div>
          </div>
        </form>
        <!--<p class="small text-muted pt-1">Next minimum bid: {{editionMinimumBid(edition.edition)}} ETH</p>-->
      </div>
      <div v-if="auction[edition.edition] && auction[edition.edition].highestBid !== '0'">
        <hr/>
        <span class="font-weight-light">Current highest</span>
        <span class="font-weight-bold">From:</span>
        <clickable-address :eth-address="auction[edition.edition].highestBidder"></clickable-address>
        <span class="font-weight-bold">for</span>
        <price-in-eth :value="auction[edition.edition].highestBid"></price-in-eth>
      </div>
      <hr/>
      <p class="text-muted">
        When you place a bid the ether is escrow's.<br/>
        On being out-bid you receive your monies back.<br/>
        On winning you will receive the artwork.<br/>
        Any issues please contact us <a href="mailto:hello@knownorigin.io" target="_blank"
                                        title="Artist Auction">email</a>
      </p>
    </div>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import _ from 'lodash';
  import * as actions from '../../../store/actions';
  import {PAGES} from "../../../store/loadingPageState";
  import ClickableAddress from "../generic/ClickableAddress";
  import PriceInEth from "../generic/PriceInEth";

  export default {
    name: 'artistAcceptingBids',
    components: {PriceInEth, ClickableAddress},
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
      ...mapGetters('kodaV2', []),
      ...mapGetters('auction', [
        'accountIsHighestBidder',
        'isEditionAuctionEnabled',
        'editionMinimumBid',
      ]),
      ...mapState('auction', [
        'auction',
        'minBidAmount',
        'minBidAmountWei',
      ]),
      ...mapGetters([]),
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
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.ARTIST_ACCEPTING_BID);
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

</style>
