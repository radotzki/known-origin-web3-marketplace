<template>
  <div class="container-fluid">

    <div class="row">
      <div class="col-12">
        <h6>Add High-res to your editions</h6>
        <p>GET Editions from artist without high-res</p>
        <p>Create form to upload high-res</p>
      </div>
    </div>

  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import * as actions from '../../../../store/actions';
  import _ from 'lodash';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    name: 'AddHighRes',
    components: {
      FontAwesomeIcon
    },
    data() {
      return {};
    },
    props: ['artist'],
    computed: {
      ...mapState([
        'account',
      ]),
      ...mapGetters([
        'findArtistsForAddress',
      ]),
    },
    methods: {},
    created() {

    },
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../../ko-colours';
  @import '../../../../ko-card';

  .hand-pointer {
    cursor: pointer;
  }

</style>
