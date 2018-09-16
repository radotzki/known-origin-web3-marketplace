<template>
  <div v-if="artist" class="clearfix">
    <p class="small-artist-name"><img :src="artist.img"/> {{ artist.name }}</p>
  </div>
</template>

<script>
  import ClickableAddress from '../generic/ClickableAddress';

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

    .lead {
      font-size: 1rem;
    }

    .small-artist-name {
      font-size: 0.75em;
    }
  }
</style>
