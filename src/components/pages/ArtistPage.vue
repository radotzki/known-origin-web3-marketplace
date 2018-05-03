<template>
  <div class="container">
    <artist-short-bio :artist="lookupArtist()"></artist-short-bio>

    <loading-spinner v-if="lookupAssetsByArtistCode($route.params.artistCode).length == 0"></loading-spinner>

    <div class="row justify-content-sm-center" v-if="lookupAssetsByArtistCode($route.params.artistCode).length == 0">
      <div class="col text-center mt-5">
        <p>We are loading assets from the Blockchain.</p>
        <p>Please be patient as we are fully decentralised.</p>
      </div>
    </div>

    <div class="card-columns mt-4">
        <galleryEdition
          v-for="assetEdition, key in lookupAssetsByArtistCode($route.params.artistCode)"
          :edition="assetEdition[0]"
          :key="key">
        </galleryEdition>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import ArtistShortBio from '../ui-controls/ArtistShortBio';
  import LoadingSpinner from '../ui-controls/LoadingSpinner';
  import Asset from '../Asset';
  import GalleryEdition from '../GalleryEdition';

  export default {
    name: 'artistPage',
    components: {ArtistShortBio, GalleryEdition, LoadingSpinner},
    computed: {
      ...mapGetters(['lookupAssetsByArtistCode'])
    },
    methods: {
      lookupArtist: function () {
        return this.$store.getters.findArtist(this.$route.params.artistCode);
      }
    }
  };
</script>

<style scoped>
</style>
