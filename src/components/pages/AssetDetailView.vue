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

    <loading-spinner v-if="!asset"></loading-spinner>

    <div class="assets_to_buy" v-if="asset">
      <asset :asset="asset" :key="asset.id"></asset>
    </div>

  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import Artist from '../Artist';
  import Asset from "../Asset.vue";
  import LoadingSpinner from "../ui-controls/LoadingSpinner.vue";

  export default {
    name: 'assetDetailView',
    components: {
      LoadingSpinner,
      Asset
    },
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
