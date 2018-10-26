<template>
  <div>
    <div class="row bg-secondary text-white full-banner">
      <div class="col text-center m-5">
        <p>Activity</p>
      </div>
    </div>

    <loading-section :page="PAGES.ACTIVITY" class="mt-5"></loading-section>

    <div class="container-fluid mt-4">
      <div class="row editions-wrap">

        <table class="table table-striped">
          <tbody>
          <tr v-for="event in limitBy(orderBy(activity, 'blockNumber', -1), 50)" :key="event.transactionHash + event.logIndex + event.event">
            <td class="w-25 text-center">
              <router-link :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: parseInt(event.args._editionNumber) }}">
                <img v-if="findEdition(parseInt(event.args._editionNumber))"
                     class="img-thumbnail"
                     :src="findEdition(parseInt(event.args._editionNumber)).lowResImg"/>
              </router-link>
            </td>
            <td>
              <code>{{ mapEvent(event.event)}}</code>
            </td>
            <td>
              <div v-if="event.args._amount">
                  {{ event.args._amount | toEth}} ETH
              </div>
              <div v-if="event.args._tokenId">
                <router-link :to="{ name: 'edition-token', params: { tokenId: event.args._tokenId.toString() }}"
                             class="badge badge-primary">
                  {{ event.args._tokenId.toString() }}
                </router-link>
              </div>
            </td>
            <td class="d-none d-md-table-cell">
              <span class="text-muted small">Block:</span> <code>{{ event.blockNumber }}</code>
            </td>
            <td class="d-none d-md-table-cell">
              <div v-if="event.args._buyer">
                <span class="text-muted small">Owner: </span>
                <clickable-address :eth-address="event.args._buyer"></clickable-address>
              </div>
              <div v-if="event.args._bidder">
                <span class="text-muted small">Bidder: </span>
                <clickable-address :eth-address="event.args._bidder"></clickable-address>
              </div>
            </td>
            <td class="d-none d-md-table-cell">
              <clickable-transaction :transaction="event.transactionHash"></clickable-transaction>
            </td>
          </tr>
          </tbody>
        </table>
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

  export default {
    name: 'activity',
    components: {
      LoadingSection,
      Availability,
      ClickableAddress,
      ClickableTransaction
    },
    data() {
      return {
        PAGES
      };
    },
    methods: {
      mapEvent: function (eventStr) {
        if (eventStr === 'EditionCreated') {
          return '👶 Birth';
        }
        if (eventStr === 'Minted') {
          return '💸 Purchase';
        }
        if (eventStr === 'BidPlaced') {
          return '💵 Bid Placed';
        }
        if (eventStr === 'BidIncreased') {
          return '📈 Bid Increased';
        }
        if (eventStr === 'BidAccepted') {
          return '💰 Bid Accepted';
        }
        return eventStr;
      }
    },
    computed: {
      ...mapGetters('kodaV2', [
        'findEdition'
      ]),
      ...mapState('activity',
        ['activity']
      )
    },
    created() {

      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ACTIVITY);

      const loadData = () => {
        this.$store.dispatch(`activity/${actions.ACTIVITY}`)
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.ACTIVITY);
          });
      };

      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        () => loadData()
      );

      if (this.$store.state.KnownOriginDigitalAssetV2) {
        loadData();
      }
    }
  };
</script>


<style scoped lang="scss">
  .full-banner {
    p {
      margin-bottom: 0;
    }
  }

  .img-thumbnail {
    max-width: 100px;
  }
</style>
