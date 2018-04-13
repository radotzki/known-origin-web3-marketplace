<template>
  <div>
    <header id="header">
      <router-link :to="{ name: 'account' }" class="pull-right">
        <img src="/../static/account.svg" style="height:25px"/>
      </router-link>
      <div class="header-branding">
        &nbsp;
        <router-link :to="{ name: 'home' }" class="back-arrow" style="float: left">
          <img src="../../../static/back_arrow.svg" style="width: 35px"/>
        </router-link>
      </div>
    </header>

    <artist-short-bio :artist="lookupArtist()"></artist-short-bio>

    <div class="centered">
      <section class="cards">
        <galleryEdition
          v-for="assetEdition, key in lookupAssetsByArtistCode($route.params.artistCode)"
          :edition="assetEdition[0]"
          :key="key">
        </galleryEdition>
      </section>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import ArtistShortBio from '../ui-controls/ArtistShortBio';
  import Asset from '../Asset';
  import GalleryEdition from '../GalleryEdition';

  export default {
    name: 'artistPage',
    components: {ArtistShortBio, GalleryEdition},
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
