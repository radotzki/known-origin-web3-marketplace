<template>
  <div class="shadow-sm bg-white p-4 mb-5" v-if="artist">
    <artist-short-bio :artist="artist"></artist-short-bio>

    <div class="text-center mb-4">
      <a class="btn btn-sm btn-twitter" v-if="artist.twitter" :href="`https://twitter.com/${artist.twitter}`" target="_blank">Twitter</a>
      <a class="btn btn-sm btn-instagram" v-if="artist.instagram" :href="`https://www.instagram.com/${artist.instagram}`" target="_blank">Instagram</a>
    </div>

    <div class="mt-4">
      <h6>Artist bio</h6>
      <p class="bio">
        {{ artist.bio }}
      </p>
    </div>

    <hr/>

    <div v-if="artist.website" class="mt-2">
      <h6>Artist website</h6>
      <p class="website">
        <a :href="artist.website" target="_blank">{{artist.website}}</a>
      </p>
    </div>
  </div>
</template>

<script>
  import ArtistShortBio from './ArtistShortBio';

  export default {
    name: 'artistPanel',
    components: {ArtistShortBio},
    props: ['artist']
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';

  .bio {
    font-size: 0.75rem;
    color: $body-color;
  }

  .website {
    font-size: 0.65rem;
  }

  h6 {
    color: $body-color;
  }

  .btn-twitter {
    background-color: #20a2eb;
    color: $body-bg;
  }

  .btn-telegram {
    background-color: #0088cc;
    color: $body-bg;
  }

  .btn-instagram {
    background-color: #c13584;
    color: $body-bg;
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    img {
      max-height: 75px;
    }
  }
</style>
