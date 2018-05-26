<template>
  <span class="high-res-container" v-if="asset.highResAvailable">
    <span class="badge badge-secondary" title="Soon you will be able to download this asset as a high-resolution image">
      high res
    </span>
    <!--<font-awesome-icon :icon="['fas', 'cloud-download-alt']"></font-awesome-icon>-->
    <!--<font-awesome-icon :icon="['fas', 'info']"></font-awesome-icon>-->
  </span>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    components: {FontAwesomeIcon},
    name: 'highResLabel',
    props: ['asset'],
    computed: {},
    methods: {}
  };
</script>

<style scoped>

</style>
