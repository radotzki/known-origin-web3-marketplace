<template>
  <div>
    <div class="row bg-secondary text-white full-banner">
      <div class="col text-center m-5">
        <p>Activity v2</p>
      </div>
    </div>

    <div class="text-center mt-5" v-if="!activity || activity.length === 0">
      <loading-spinner></loading-spinner>
    </div>

    <div class="container-fluid mt-4">
      <div class="row editions-wrap">

        <table class="table table-striped">
          <tbody>
          <tr v-for="event in orderBy(activity, 'blockNumber', -1)">
            <td class="w-25 text-center"><img v-if="findEdition(parseInt(event.args._editionNumber))" class="img-thumbnail" :src="findEdition(parseInt(event.args._editionNumber)).lowResImg"/></td>
            <td><span class="badge badge-primary">{{ event.args._tokenId.toString() }}</span></td>
            <td><span class="text-muted small">Block:</span> <code>{{ event.blockNumber }}</code></td>
            <td><span class="text-muted small">Owner:</span>
              <clickable-address :eth-address="event.args._buyer"></clickable-address>
            </td>
            <td>
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
  import LoadingSpinner from '../ui-controls/generic/LoadingSpinner';

  export default {
    name: 'activity',
    components: {
      LoadingSpinner,
      Availability,
      ClickableAddress,
      ClickableTransaction
    },
    data () {
      return {};
    },
    methods: {
      goToArtist: function (artistAccount) {
        this.$router.push({name: 'artist-v2', params: {artistAccount}});
      }
    },
    computed: {
      ...mapGetters('kodaV2', [
        'findEdition'
      ]),
      ...mapState(['activity'])
    },
    mounted () {

      const loadData = () => {
        this.$store.dispatch(actions.ACTIVITY);

        setTimeout(function () {
          this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS_FOR_TYPE}`, {editionType: 1});
        }.bind(this), 5000);
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
