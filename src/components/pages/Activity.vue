<template>
  <div>
    <div class="row bg-primary full-banner-secondary pt-3 mt-1">
      <div class="col text-center">
        Activity
      </div>
    </div>

    <!--<loading-section :page="PAGES.ACTIVITY" class="mt-5"></loading-section>-->

    <div class="container-fluid mt-2">

      <div class="row">
        <div class="col">
          <table class="table table-striped">
            <tbody>
            <tr v-for="event in activity">
              <td class="w-25 text-center">
                <router-link
                  :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: parseInt(event._args._editionNumber) }}">
                  <edition-image class="img-thumbnail"
                                 :src="(findEdition(parseInt(event._args._editionNumber)) || {}).lowResImg"/>
                </router-link>
              </td>

              <td>
                {{ mapMobileEvent(event) }}
                <code class="d-none d-md-inline">{{ mapEvent(event)}}</code>
              </td>
              <td>

                <div v-if="event._args._priceInWei && event._args._priceInWei !== '0'">
                  <price-in-eth :value="event._args._priceInWei | toEth"></price-in-eth>
                  <u-s-d-price-converter
                    :price-in-wei="event._args._priceInWei"
                    :usd-exchange-rate="event.exchangeRate.usd">
                  </u-s-d-price-converter>
                </div>

                <div v-else-if="event._args._amount && event._args._amount !== '0'">
                  <price-in-eth :value="event._args._amount | toEth"></price-in-eth>
                  <u-s-d-price-converter
                    :price-in-wei="event._args._amount"
                    :usd-exchange-rate="event.exchangeRate.usd">
                  </u-s-d-price-converter>
                </div>

                <div v-if="event._args._tokenId">
                  <router-link :to="{ name: 'edition-token', params: { tokenId: event._args._tokenId.toString() }}"
                               class="badge badge-primary">
                    {{ event._args._tokenId.toString() }}
                  </router-link>
                </div>
              </td>
              <td class="d-none d-md-table-cell">
                <small>{{ event.blockTimestamp | moment('ddd Do MMM YYYY h:mma')}}</small>
              </td>
              <td class="d-none d-md-table-cell">
                <div v-if="event._args._buyer">
                  <span class="text-muted small">Owner: </span>
                  <clickable-address :eth-address="event._args._buyer" class="small"></clickable-address>
                </div>
                <div v-if="event._args._bidder">
                  <span class="text-muted small">Bidder: </span>
                  <clickable-address :eth-address="event._args._bidder" class="small"></clickable-address>
                </div>
              </td>
              <td>
                <view-transaction-details :transaction="event.transactionHash"
                                          class="small"></view-transaction-details>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="row" v-if="canShowMore">
        <div class="col-12 text-center">
          <button @click="showMore" class="btn btn-outline-primary">
            <font-awesome-icon :icon="['fas', 'spinner']" spin v-if="isLoading"></font-awesome-icon>
            <span v-if="!isLoading">Show more</span>
          </button>
        </div>
      </div>

      <div class="text-muted small mb-5 mt-3 text-right">Updated every 5 minutes</div>
    </div>
  </div>
</template>
<script>

  import _ from 'lodash';
  import {mapGetters, mapState} from 'vuex';
  import ClickableAddress from '../ui-controls/generic/ClickableAddress';
  import ClickableTransaction from '../ui-controls/generic/ClickableTransaction.vue';
  import * as actions from '../../store/actions';
  import Availability from '../ui-controls/v2/Availability';
  import {PAGES} from '../../store/loadingPageState';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import ViewTransactionDetails from '../ui-controls/generic/ViewTransactionDetails';
  import EditionImage from "../ui-controls/generic/EditionImage";
  import USDPriceConverter from "../ui-controls/generic/USDPriceConverter";
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import PriceInEth from '../ui-controls/generic/PriceInEth';

  export default {
    name: 'activity',
    components: {
      PriceInEth,
      USDPriceConverter,
      EditionImage,
      LoadingSection,
      Availability,
      ClickableAddress,
      ClickableTransaction,
      ViewTransactionDetails,
      FontAwesomeIcon
    },
    data() {
      return {
        PAGES,
        activity: [],
        limit: 50,
        isLoading: false,
        resultsAvailable: 0
      };
    },
    methods: {
      showMore: function () {
        this.isLoading = true;
        this.offset = this.offset + this.limit;
        this.$store.state.eventService
          .loadEventsActivity(this.limit, this.offset)
          .then((results) => {
            if (results.success) {
              const {data, limit, offset, resultsAvailable} = results;
              this.limit = limit;
              this.offset = offset;
              this.resultsAvailable = resultsAvailable;
              _.forEach(data, (result) => {
                this.activity.push(result);
              });
              this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.ACTIVITY);
              this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, _.uniq(_.map(data, '_args._editionNumber')));
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
      },
      canShowMore: function () {
        const totalAvailable = this.resultsAvailable;
        if (totalAvailable === 0) {
          return false;
        }
        return totalAvailable > (this.offset + this.limit);
      },
      mapEvent: function (event) {
        const eventStr = event.event;
        if (eventStr === 'EditionCreated') {
          return 'Creation';
        }

        if (eventStr === 'Purchase' && _.get(event, '_args._priceInWei', '0') === '0') {
          return 'Gifted';
        } else if (eventStr === 'Purchase' && _.get(event, '_args._priceInWei', '0') !== '0') {
          return 'Purchase';
        }

        if (eventStr === 'BidPlaced') {
          return 'Bid Placed';
        }
        if (eventStr === 'BidIncreased') {
          return 'Bid Increased';
        }
        if (eventStr === 'BidAccepted') {
          return 'Bid Accepted';
        }
        if (eventStr === 'BidderRefunded') {
          return 'Bidder Refunded';
        }
        if (eventStr === 'PriceChanged') {
          return 'Price Changed';
        }
        return eventStr;
      },
      mapMobileEvent: function (event) {
        const eventStr = event.event;
        if (eventStr === 'EditionCreated') {
          return '⚡';
        }

        if (eventStr === 'Purchase' && _.get(event, '_args._priceInWei', '0') === '0') {
          return '🎁';
        } else if (eventStr === 'Purchase' && _.get(event, '_args._priceInWei', '0') !== '0') {
          return '💸';
        }

        if (eventStr === 'BidPlaced') {
          return '💌';
        }
        if (eventStr === 'BidIncreased') {
          return '📈';
        }
        if (eventStr === 'BidAccepted') {
          return '👍';
        }
        if (eventStr === 'BidderRefunded') {
          return '🤑';
        }
        if (eventStr === 'PriceChanged') {
          return '💰';
        }
        return eventStr;
      }
    },
    computed: {
      ...mapGetters('kodaV2', [
        'findEdition'
      ]),
    },
    async created() {
      // this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ACTIVITY);
      this.isLoading = true;

      const loadApiData = () => {
        this.$store.state.eventService.loadEventsActivity(this.limit, this.offset)
          .then((results) => {
            if (results.success) {
              const {data, limit, offset, resultsAvailable} = results;
              this.limit = limit;
              this.offset = offset;
              this.resultsAvailable = resultsAvailable;
              _.forEach(data, (result) => {
                this.activity.push(result);
              });
              // this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.ACTIVITY);
              this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, _.uniq(_.map(data, '_args._editionNumber')));
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
      };

      this.$store.watch(
        () => this.$store.state.eventService.currentNetworkId,
        (newVal, oldVal) => {
          if (_.toString(newVal) !== _.toString(oldVal)) {
            // change detected, reloading gallery
            loadApiData();
          }
        }
      );

      if (this.$store.state.eventService.currentNetworkId) {
        loadApiData();
      }
    }
  };
</script>


<style scoped lang="scss">
  @import '../../ko-colours.scss';

  .full-banner {
    p {
      margin-bottom: 0;
    }
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    .container-fluid {
      padding-left: 0;
      padding-right: 0;
    }
  }

  .img-thumbnail {
    max-width: 100px;
  }
</style>
