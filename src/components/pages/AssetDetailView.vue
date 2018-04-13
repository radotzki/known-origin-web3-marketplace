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

    <div>
      <div class="centered" v-if="asset">
        <section class="cards centered" v-if="asset">
          <asset :asset="asset" :key="asset.id">
          </asset>
        </section>
      </div>

      <div class="border-box-buttons">
        <div class="pad-bottom">

          <button type="button" class="btn btn-link" @click="goHome">
            Gallery
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import Artist from '../Artist';
  import Asset from "../Asset.vue";

  export default {
    name: 'assetDetailView',
    components: {Asset},
    props: {
      tokenId: {
        required: true,
        type: String
      }
    },
    methods: {
      goHome() {
        this.$router.push({name: 'home'});
      }
    },
    computed: {
      ...mapGetters([]),
      ...mapState([]),
      asset: function () {
        return this.$store.getters.assetById(this.tokenId);
      }
    },
    mounted() {

    },
  };
</script>

<style scoped>
  .border-box-buttons {
    margin: 15px;
  }
</style>
