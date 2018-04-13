<template>
  <div id="artists">
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

    <h1>Artists</h1>

    <div>
      <section class="cards">
        <artist v-for="artist in visibleAssets()" :key="artist.name" :artist="artist"></artist>
      </section>
    </div>

  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import Artist from '../Artist';

  export default {
    name: 'artists',
    components: {Artist},
    computed: {
      ...mapGetters([
        'visibleAssets',
      ]),
      ...mapState([
        'assets',
      ]),
    },
    mounted() {

    },
  };
</script>

<style scoped>

</style>
