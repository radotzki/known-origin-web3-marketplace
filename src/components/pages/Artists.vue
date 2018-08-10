<template>
  <div>
    <div class="row bg-secondary text-white full-banner mb-5">
      <div class="col text-center m-5">
        <p>Artists</p>
      </div>
    </div>

    <div class="container mb-5">
      <div class="card-columns">
        <artist v-for="artist in liveArtists" :key="artist.name" :artist="artist"></artist>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import Artist from '../Artist';

  export default {
    name: 'artists',
    components: {Artist},
    computed: {
      ...mapGetters([
        'liveArtists',
      ]),
      ...mapState('assets', [
        'assets',
      ]),
    },
    mounted () {

    },
  };
</script>

<style scoped lang="scss">
</style>
