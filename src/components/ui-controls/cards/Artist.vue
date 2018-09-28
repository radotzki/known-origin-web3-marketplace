<template>
  <router-link :to="{ name: 'artist-v2', params: { artistAccount: getArtistAddress() } }">
    <div class="card text-center shadow-sm" v-if="artist">
      <div class="align-middle">
        <img :src="artist.img" class="pt-4"/>
      </div>
      <div class="card-body">
        <h5 class="card-title text-uppercase">{{ artist.name }}</h5>
        <p class="card-text card-desc text-left">{{ artist.strapline }}</p>
      </div>
    </div>
  </router-link>
</template>

<script>
  import _ from 'lodash';

  export default {
    name: 'artist',
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
