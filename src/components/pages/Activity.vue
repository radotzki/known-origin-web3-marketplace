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
          <tr v-for="event in limitBy(orderBy(activity, 'blockNumber', -1), 50)">
            <td class="w-25 text-center"><img v-if="findEdition(parseInt(event.args._editionNumber))" class="img-thumbnail" :src="findEdition(parseInt(event.args._editionNumber)).lowResImg"/></td>
            <td><code>{{ mapEvent(event.event) }}</code></td>
            <td><span class="badge badge-primary" v-if="event.args._tokenId">{{ event.args._tokenId.toString() }}</span></td>
            <td class="d-none d-md-table-cell">
              <span class="text-muted small">Block:</span> <code>{{ event.blockNumber }}</code>
            </td>
            <td class="d-none d-md-table-cell">
              <span class="text-muted small" v-if="event.args._buyer">Owner: </span><clickable-address :eth-address="event.args._buyer"></clickable-address>
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
  import { mapGetters, mapState } from 'vuex';
  import ClickableAddress from '../ui-controls/generic/ClickableAddress';
  import ClickableTransaction from '../ui-controls/generic/ClickableTransaction.vue';
  import * as actions from '../../store/actions';
  import Availability from '../ui-controls/v2/Availability';
  import { PAGES } from '../../store/loadingPageState';
  import LoadingSection from '../ui-controls/generic/LoadingSection';

  export default {
    name: 'activity',
    components: {
      LoadingSection,
      Availability,
      ClickableAddress,
      ClickableTransaction
    },
    data () {
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
    created () {

      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ACTIVITY);

      const loadData = () => {
        this.$store.dispatch(`activity/${actions.ACTIVITY}`);
        this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.ACTIVITY);
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
