<template>
  <div>
    <div class="row bg-primary full-banner-secondary pt-3 mt-1">
      <div class="col text-center">
        Activity
      </div>
    </div>

    <div class="container-fluid mt-2">

      <div class="row">
        <div class="col">
          <table class="table">
            <tbody>
            <tr v-for="(event, $index) in activity">
              <td class="w-10 text-right" v-if="event._args._editionNumber">
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

                <!--<div v-if="event._args._editionNumber">-->
                <!--<router-link-->
                <!--:to="{ name: 'confirmPurchaseSimple', params: { editionNumber: parseInt(event._args._editionNumber) }}"-->
                <!--class="badge badge-primary">-->
                <!--{{event._args._editionNumber}}-->
                <!--</router-link>-->
                <!--</div>-->
              </td>
              <td class="d-none d-md-table-cell">
                <small>{{ event.blockTimestamp | moment('ddd Do MMM YYYY h:mma')}}</small>
              </td>
              <td class="d-none d-md-table-cell">
                <div v-if="event._args._buyer">
                  <span class="text-muted small">Owner: </span>
                  <clickable-address :eth-address="event._args._buyer" class="small"></clickable-address>
                </div>
                <div v-if="event._args._to">
                  <span class="text-muted small">Owner: </span>
                  <clickable-address :eth-address="event._args._to" class="small"></clickable-address>
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

      <infinite-loading @infinite="showMore" v-if="canShowMore">
        <div slot="spinner">
          <font-awesome-icon :icon="['fas', 'spinner']" spin v-if="isLoading"></font-awesome-icon>
        </div>
      </infinite-loading>

      <div class="text-muted small mb-5 mt-3 text-right">
        Updated every 5 minutes
        <br/>
        <small>(USD prices powered by <a href="https://www.coingecko.com" target="_blank">coingecko</a>)</small>
      </div>
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
  import {mapEvent, mapMobileEvent} from '../../services/eventMapper';
  import InfiniteLoading from 'vue-infinite-loading';

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
      FontAwesomeIcon,
      InfiniteLoading
    },
    data() {
      return {
        PAGES,
        activity: [],
        limit: 20,
        offset: 0,
        isLoading: false,
        resultsAvailable: 0
      };
    },
    methods: {
      mapEvent,
      mapMobileEvent,
      showMore($state) {
        this.isLoading = true;

        this.$store.state.eventService.loadEventsActivity(this.limit, this.offset)
          .then((results) => {
            if (results.success) {
              const {data, limit, offset, resultsAvailable} = results;
              this.limit = limit;
              this.offset = offset + limit;
              this.resultsAvailable = resultsAvailable;
              _.forEach(data, (result) => {
                this.activity.push(result);
              });
              return this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, _.uniq(_.map(data, '_args._editionNumber')));
            }
          })
          .then(() => {
            if (this.canShowMore()) {
              $state.complete();
            } else {
              $state.loaded();
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
      },
      canShowMore() {
        const totalAvailable = this.resultsAvailable;
        if (totalAvailable === 0) {
          return false;
        }
        return totalAvailable > (this.offset + this.limit);
      }
    },
    computed: {
      ...mapGetters('kodaV2', [
        'findEdition'
      ]),
    },
    created() {
      this.$store.watch(
        () => this.$store.state.eventService.currentNetworkId,
        (networkIfChange) => {
          // if we change networks - restart the process
          if (networkIfChange !== 1) {
            this.activity = [];
            this.limit = 20;
            this.offset = 0;
            this.resultsAvailable = 0;
            this.showMore({loaded: _.noop});
          }
        });
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
    max-width: 75px;
  }

  .table {
    vertical-align: middle;
  }
</style>
