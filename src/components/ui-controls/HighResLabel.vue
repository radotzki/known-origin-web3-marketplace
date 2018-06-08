<template>
  <span class="high-res-container" v-if="asset.highResAvailable">
    <span class="badge badge-secondary"
          v-b-tooltip.hover :id="'tooltipButton-highRes-info-' + uuid">
      high res
    </span>

    <b-tooltip
      ref="tooltip"
      :target="'tooltipButton-highRes-info-' + uuid">
      If purchased, a high resolution version can be <strong>downloaded!</strong>
    </b-tooltip>
  </span>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import HighResDownload from "./HighResDownload.vue";
  import {mapGetters, mapState} from 'vuex';

  export default {
    components: {
      HighResDownload,
      FontAwesomeIcon
    },
    name: 'highResLabel',
    props: ['asset'],
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

<style scoped>

</style>
