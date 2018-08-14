<template>
  <div class="container">

    <h1>Artists</h1>

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
