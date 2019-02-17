<template>
  <div class="row editions-wrap mt-2">

    <div class="col-12">
      <h5 class="mb-3">Your Activity</h5>
    </div>

    <div class="col-12" v-if="activity.length === 0">
      <code>No activity found</code>
    </div>

    <table class="table table-striped">
      <tbody>
      <tr v-for="event in activity">
        <td class="w-25 text-center" v-if="event._args._editionNumber">
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

          <div v-if="event._args._tokenId && event.event !== 'Purchase'">
            <router-link :to="{ name: 'edition-token', params: { tokenId: event._args._tokenId.toString() }}"
                         class="badge badge-primary">
              {{ event._args._tokenId.toString() }}
            </router-link>
          </div>

          <div v-if="event._args._editionNumber && event.event === 'Purchase'">
            <router-link
              :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: parseInt(event._args._editionNumber) }}"
              class="badge badge-primary">
              {{event._args._editionNumber}}
            </router-link>
          </div>
        </td>
        <td class="d-none d-md-table-cell">
          <small>{{ event.blockTimestamp | moment('ddd Do MMM YYYY h:mma')}}</small>
        </td>
        <td>
          <view-transaction-details :transaction="event.transactionHash" class="small"></view-transaction-details>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import _ from 'lodash';
  import PriceInEth from "../generic/PriceInEth";
  import USDPriceConverter from "../generic/USDPriceConverter";
  import EditionImage from "../generic/EditionImage";
  import ClickableAddress from "../generic/ClickableAddress";
  import ViewTransactionDetails from "../generic/ViewTransactionDetails";
  import * as actions from '../../../store/actions';
  import {mapEvent, mapMobileEvent} from '../../../services/eventMapper';

  export default {
    name: 'accountActivity',
    components: {
      ViewTransactionDetails,
      ClickableAddress,
      EditionImage,
      USDPriceConverter,
      PriceInEth
    },
    data() {
      return {
        activity: []
      };
    },
    computed: {
      ...mapState([
        'account',
      ]),
      ...mapGetters('kodaV2', [
        'findEdition'
      ]),
    },
    methods: {
      mapEvent,
      mapMobileEvent
    },
    async created() {

      const loadApiData = () => {
        this.$store.state.eventService.loadAddressActivity(this.account)
          .then((results) => {
            if (results.success) {
              const {data, resultsAvailable} = results;
              this.resultsAvailable = resultsAvailable;
              _.forEach(data, (result) => {
                this.activity.push(result);
              });
              this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, _.uniq(_.map(data, '_args._editionNumber')));
            }
          });
      };

      this.$store.watch(
        () => this.$store.state.eventService.currentNetworkId,
        (newVal, oldVal) => {
          if (_.toString(newVal) !== _.toString(oldVal)) {
            loadApiData();
          }
        }
      );

      if (this.$store.state.eventService.currentNetworkId) {
        loadApiData();
      }
    },
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card.scss';


  .img-thumbnail {
    max-width: 125px;
  }
</style>
