<template>
  <div>
    <div class="row bg-secondary text-white full-banner">
      <div class="col text-center m-5">
        <p>Artists</p>
      </div>
    </div>

    <div class="container mt-4">
      <div class="card-columns">
        <artist v-for="artist in liveArtists" :key="artist.name" :artist="artist"></artist>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import Artist from '../ui-controls/cards/Artist';

  export default {
    name: 'artists',
    components: {Artist},
    computed: {
      ...mapGetters([
        'liveArtists',
      ]),
    },
    mounted () {

    },
  };
</script>

<style scoped lang="scss">
</style>
