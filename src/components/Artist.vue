<template>
  <router-link :to="{ name: 'artist-v2', params: { artistAccount: artist.ethAddress } }">
    <div class="card text-center shadow-sm" v-if="artist">
      <img :src="artist.img" class="pt-4"/>
      <div class="card-body">
        <h5 class="card-title text-uppercase">{{ artist.name }}</h5>
        <p class="card-text card-desc text-left">{{ artist.strapline }}</p>
      </div>
    </div>
  </router-link>
</template>

<script>
  export default {
    name: 'artist',
    props: ['artist'],
  };
</script>

<style scoped>
  img {
    width: 50%;
  }

  a {
    color: inherit;
  }
</style>
