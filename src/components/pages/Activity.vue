<template>
  <div>
    <div class="row bg-primary full-banner-secondary pt-3 mt-1">
      <div class="col text-center">
        Activity
      </div>
    </div>

    <loading-section :page="PAGES.ACTIVITY" class="mt-5"></loading-section>

    <div class="container-fluid mt-2">
      <div class="row">
        <div class="col">
          <table class="table table-striped">
            <tbody>
            <tr v-for="event in limitBy(orderBy(activity, 'blockNumber', -1), 75)">
              <td class="w-25 text-center">
                <router-link
                  :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: parseInt(event._args._editionNumber) }}">
                  <edition-image class="img-thumbnail"
                                 :src="(findEdition(parseInt(event._args._editionNumber)) || {}).lowResImg"/>
                </router-link>
              </td>
              <td>
                {{ mapMobileEvent(event.event) }}
                <code class="d-none d-md-inline">{{ mapEvent(event.event)}}</code>
              </td>
              <td>
                <div v-if="event._args._amount" class="small">
                  {{ event._args._amount | toEth}} ETH
                </div>
                <div v-if="event._args._tokenId">
                  <router-link :to="{ name: 'edition-token', params: { tokenId: event._args._tokenId.toString() }}"
                               class="badge badge-primary">
                    {{ event._args._tokenId.toString() }}
                  </router-link>
                </div>
              </td>
              <td class="d-none d-md-table-cell">
                <span class="text-muted small">Block:</span> <code>{{ event.blockNumber }}</code>
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

  export default {
    name: 'activity',
    components: {
      EditionImage,
      LoadingSection,
      Availability,
      ClickableAddress,
      ClickableTransaction,
      ViewTransactionDetails
    },
    data() {
      return {
        PAGES,
        activity: []
      };
    },
    methods: {
      mapEvent: function (eventStr) {
        if (eventStr === 'EditionCreated') {
          return 'Creation';
        }
        if (eventStr === 'Minted') {
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
        return eventStr;
      },
      mapMobileEvent: function (eventStr) {
        if (eventStr === 'EditionCreated') {
          return '⚡';
        }
        if (eventStr === 'Minted') {
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
        return eventStr;
      }
    },
    computed: {
      ...mapGetters('kodaV2', [
        'findEdition'
      ]),
    },
    created() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ACTIVITY);

      const loadData = () => {
        this.$store.state.eventService
          .loadActivity()
          .then((activity) => {
            this.activity = activity;
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.ACTIVITY);
            this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, _.uniq(_.map(this.activity, '_args._editionNumber')));
          });
      };

      this.$store.watch(
        () => this.$store.state.eventService,
        () => loadData()
      );

      if (this.$store.state.eventService) {
        loadData();
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
