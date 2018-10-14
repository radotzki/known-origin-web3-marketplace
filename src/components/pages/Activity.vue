<template>
  <div>
    <div class="row bg-secondary text-white full-banner">
      <div class="col text-center m-5">
        <p>Activity v2</p>
      </div>
    </div>


    <div class="container-fluid mt-4">


      <div class="row editions-wrap">
        {{ activity }}
      </div>


    </div>
  </div>
</template>
<script>

  import _ from 'lodash';
  import { mapGetters, mapState } from 'vuex';
  import ClickableAddress from '../ui-controls/generic/ClickableAddress';
  import * as actions from '../../store/actions';
  import { PAGES } from '../../store/loadingPageState';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import Availability from '../ui-controls/v2/Availability';

  export default {
    name: 'activity',
    components: {
      Availability,
      ClickableAddress,
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
        'filterEditions',
        'featuredArtistAccount'
      ]),
      ...mapGetters([
        'findArtistsForAddress'
      ]),
      ...mapState(['activity']),
      editions: function () {
        return this.filterEditions(this.priceFilter);
      }
    },
    mounted () {
      setTimeout(function () {
        this.$store.dispatch(actions.ACTIVITY);
      }.bind(this), 5000);
    }
  };
</script>


<style scoped lang="scss">
  .full-banner {
    p {
      margin-bottom: 0;
    }
  }

</style>
