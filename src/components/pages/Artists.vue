<template>
  <div>
    <div class="row bg-primary full-banner-secondary pt-3 mt-1">
      <div class="col text-center">
        Artists
      </div>
    </div>

    <div class="container-fluid mt-4">
      <div class="row editions-wrap mb-4">
        <div class="card-columns">
          <div v-for="artist in liveArtists" :key="artist.name">
            <router-link :to="{ name: 'artist', params: { artistAccount: getArtistAddress(artist) } }">
              <simple-artist-panel :artist="artist"></simple-artist-panel>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import Artist from '../ui-controls/cards/Artist';
  import SimpleArtistPanel from '../ui-controls/artist/SimpleArtistPanel';

  export default {
    name: 'artists',
    components: {Artist, SimpleArtistPanel},
    computed: {
      ...mapGetters([
        'liveArtists',
      ]),
    },
    mounted () {

    },
    methods: {
      getArtistAddress: function (artist) {
        if (_.isArray(artist.ethAddress)) {
          return artist.ethAddress[0];
        }
        return artist.ethAddress;
      }
    }
  };
</script>

<style scoped lang="scss">
  a {
    text-decoration: none;
  }
</style>
