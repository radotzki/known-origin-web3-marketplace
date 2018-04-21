<template>
  <div>
    <h1>Artists</h1>

    <div class="card-columns">
        <artist v-for="artist in visibleAssets()" :key="artist.name" :artist="artist"></artist>
    </div>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import Artist from '../Artist';

  export default {
    name: 'artists',
    components: {Artist},
    computed: {
      ...mapGetters([
        'visibleAssets',
      ]),
      ...mapState([
        'assets',
      ]),
    },
    mounted() {

    },
  };
</script>

<style scoped lang="scss">
</style>
