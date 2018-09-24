<template>
  <div v-if="artist" class="text-center mt-2 mb-2">
    <img :src="artist.img"/>
    <h4>{{ artist.name }}</h4>
    <p class="bg-white">
      <clickable-address :eth-address="artist.ethAddress"></clickable-address>
    </p>
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
  @import '../../../ko-colours.scss';

  img {
    max-height: 75px;
  }

  h4 {
    color: $body-color;
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    img {
      max-height: 75px;
    }

    .artist-name {
      font-size: 1rem;
    }


  }
</style>
