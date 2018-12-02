<template>
  <router-link :to="{ name: 'artist-v2', params: { artistAccount: getArtistAddress() } }">
    <div class="card text-center shadow-sm" v-if="artist">
      <div class="align-middle">
        <artist-image :logo="artist.logo" class="pt-4"></artist-image>
      </div>
      <div class="card-body">
        <h5 class="card-title text-uppercase">{{ artist.name }}</h5>
        <p class="card-text card-desc text-left">{{ artist.shortDescription }}</p>
      </div>
    </div>
  </router-link>
</template>

<script>
  import _ from 'lodash';
  import ArtistImage from "../artist/ArtistImage";

  export default {
    name: 'artist',
    components: {ArtistImage},
    props: ['artist'],
    methods: {
      getArtistAddress: function () {
        if (_.isArray(this.artist.ethAddress)) {
          return this.artist.ethAddress[0];
        }
        return this.artist.ethAddress;
      }
    }
  };
</script>

<style scoped>
  img {
    width: 35%;
  }

  a {
    color: inherit;
  }
</style>
