<template>
  <div class="shadow-sm bg-white mb-4 card simple-artist-panel">
    <artist-short-bio :artist="artist" :nolinks="true"></artist-short-bio>

    <p class="bio mt-2 ml-3 mr-3">
      {{ artist.strapline }}
    </p>
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
    min-height: 275px;
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
