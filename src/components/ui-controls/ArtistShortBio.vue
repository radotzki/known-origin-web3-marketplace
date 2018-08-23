<template>
  <div v-if="artist" class="clearfix">
    <h1>{{ artist.name }}</h1>
    <img :src="artist.img" class="float-left pr-4"/>
    <p class="mt-4 mb-4 ml-5 mr-5">
      {{ artist.strapline }}
      <small v-if="artist.ethAddress"><br/><clickable-address :eth-address="artist.ethAddress"></clickable-address></small>
    </p>
  </div>
</template>

<script>
  import ClickableAddress from '../ui-controls/ClickableAddress';

  export default {
    name: 'artistShortBio',
    components: {ClickableAddress},
    props: ['artist']
  };
</script>

<style scoped lang="scss">
  img {
    max-height: 125px;
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    img {
      max-height: 75px;
    }

    .lead {
      font-size: 1rem;
    }
  }
</style>
