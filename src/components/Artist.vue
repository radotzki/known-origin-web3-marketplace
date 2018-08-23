<template>
  <div class="card text-center shadow-sm" v-if="artist">
    <router-link :to="{ name: 'artist-v2', params: { artistCode: artist.ethAddress} }">
        <img :src="artist.img" class="pt-4"/>
    </router-link>

    <div class="card-body">

      <h5 class="card-title text-uppercase">
        <router-link :to="{ name: 'artist-v2', params: { artistAccount: artist.ethAddress } }">
          {{ artist.name }}
        </router-link>
      </h5>

      <p class="card-text text-left">{{ artist.strapline }}</p>
    </div>
  </div>
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
</style>
