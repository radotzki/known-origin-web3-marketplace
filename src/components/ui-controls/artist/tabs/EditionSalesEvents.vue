<template>
  <div class="container-fluid">

    <h3>Sales</h3>
    <p>
      History of sales and accepted bids<br />
      <small class="text-muted">Showing transactions where ETH was exchanged</small>
    </p>

    <lazy-component @show="visibilityChanged">

      <div v-if="events.length > 0" class="pb-4">

        <table class="table table-striped">
          <tbody>
          <tr v-for="event in events">
            <td class="text-center" v-if="event._args._editionNumber">
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
            </td>
            <td class="d-none d-md-table-cell">
              <small>{{ event.blockTimestamp | moment('ddd Do MMM YYYY h:mma')}}</small>
            </td>
            <td>
              <div v-if="event._args._tokenId">
                <router-link :to="{ name: 'edition-token', params: { tokenId: event._args._tokenId.toString() }}"
                             class="badge badge-primary">
                  {{ event._args._tokenId.toString() }}
                </router-link>
              </div>
              <view-transaction-details :transaction="event.transactionHash" class="small"></view-transaction-details>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

    </lazy-component>

    <div class="text-muted small mb-5 mt-3 text-right">
      Updated every 5 minutes
      <br/>
      <small>(USD prices powered by <a href="https://www.coingecko.com" target="_blank">coingecko</a>)</small>
    </div>

  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import EditionImage from "../../generic/EditionImage";

  import {PAGES} from '../../../../store/loadingPageState';
  import _ from 'lodash';
  import {mapEvent, mapMobileEvent} from '../../../../services/eventMapper';
  import PriceInEth from "../../generic/PriceInEth";
  import USDPriceConverter from "../../generic/USDPriceConverter";
  import ViewTransactionDetails from "../../generic/ViewTransactionDetails";

  // TODO is this in the right place - move to management

  export default {
    name: 'editionSalesEvents',
    components: {
      ViewTransactionDetails,
      EditionImage,
      USDPriceConverter,
      PriceInEth
    },
    data() {
      return {
        PAGES,
        events: [],
        loaded: false,
        isLoading: false,
        resultsAvailable: 0
      };
    },
    props: {
      editions: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    computed: {
      ...mapGetters('kodaV2', [
        'findEdition'
      ]),
    },
    methods: {
      mapMobileEvent,
      mapEvent,
      // We only trigger the loading when we become visible to save the extra load
      visibilityChanged() {
        if (this.editions && !this.loaded) {
          this.loadApiData();
        }
      },
      loadApiData() {
        this.isLoading = true;
        this.loaded = true;
        this.$store.state.eventService.loadPurchaseEventsForEditions(_.keys(this.editions))
          .then((results) => {
            if (results.success) {
              const {data, resultsAvailable} = results;
              this.resultsAvailable = resultsAvailable;
              _.forEach(data, (result) => {
                this.events.push(result);
              });
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    },
    watch: {
      editions: function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.loadApiData();
        }
      }
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../../ko-colours';
  @import '../../../../ko-card';

  .img-thumbnail {
    max-width: 50px;
  }
</style>
