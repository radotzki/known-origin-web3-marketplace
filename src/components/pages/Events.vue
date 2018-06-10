<template>
  <div class="container">
    <h1>Event Stream</h1>

    <div class="card-columns">
        <!--<artist v-for="artist in liveArtists" :key="artist.name" :artist="artist"></artist>-->
        {{ events }}
    </div>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';

  export default {
    name: 'events',
    components: {},
    computed: {
      ...mapGetters([]),
      ...mapState('assets', ['events'])
    },
  };
</script>

<style scoped lang="scss">
</style>
