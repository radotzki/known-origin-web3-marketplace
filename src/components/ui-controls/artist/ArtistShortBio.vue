<template>
  <div v-if="artist" class="text-center mt-4 mb-2">
    <img :src="artist.img"/>
    <h4 class="mt-4">{{ artist.name }}</h4>
    <p v-if="!nolinks">
      <clickable-address :eth-address="getArtistAddress(artist)"></clickable-address>
    </p>
  </div>
</template>

<script>
  import ClickableAddress from '../generic/ClickableAddress';

  export default {
    name: 'artistShortBio',
    components: {ClickableAddress},
    props: ['artist', 'nolinks'],
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
