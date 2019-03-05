<template>
  <div class="shadow-sm bg-white card" v-if="artist">
    <div class="card-body">
      <artist-short-bio :artist="artist" :nolinks="true"></artist-short-bio>
      <p class="bio mt-4 ml-3 mr-3 text-center">
        {{ artist.shortDescription }}
      </p>
    </div>
  </div>
</template>

<script>
  import ArtistShortBio from './ArtistShortBio';

  export default {
    name: 'simpleArtistPanel',
    components: {ArtistShortBio},
    props: ['artist']
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';

  .simple-artist-panel {
    min-height: 285px;
  }

  .bio {
    font-size: 0.75rem;
    color: $body-color;
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

  /* mobile only */
  @media screen and (max-width: 767px) {
    img {
      max-height: 75px;
    }
  }
</style>
