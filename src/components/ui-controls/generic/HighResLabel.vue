<template>
  <span class="high-res-container pr-2" v-if="highResAvailable">
    <span class="badge badge-success" v-b-tooltip.hover :id="'tooltipButton-highRes-info-' + uuid">
      high res
    </span>

    <b-tooltip
      ref="tooltip"
      :target="'tooltipButton-highRes-info-' + uuid">
      Includes a high resolution version
    </b-tooltip>
  </span>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import {mapGetters, mapState} from 'vuex';

  export default {
    components: {
      FontAwesomeIcon
    },
    name: 'highResLabel',
    props: ['highResAvailable'],
    data() {
      return {
        // We gen a random ID to bind the popup to
        uuid: Math.floor(Math.random() * Math.floor(1000))
      };
    },
    computed: {
      ...mapState([
        'account',
      ]),
    }
  };
</script>

<style scoped lang="scss">
  .badge {
    border-radius: 0;
  }
</style>
