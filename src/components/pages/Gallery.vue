<template>
  <div id="gallery">

    <header id="header">
      <router-link :to="{ name: 'account' }" class="pull-right">
        <img src="/../static/account.svg" style="height:25px"/>
      </router-link>
      <div class="header-branding ">
        <router-link :to="{ name: 'home' }" class="header-dash">KnownOrigin.io</router-link>
      </div>
    </header>

    <h1>Gallery</h1>

    <div class="filters">
        <toggle-button :value="showSold"
                       :labels="{checked: 'Sold', unchecked: 'Unsold'}"
                       :sync="true" color="#82C7EB" :width="65"
                       @change="onSoldToggleChanged"/>

        <select style="border: thin dashed;" title="price filter" v-model="priceFilter">
          <option value="asc">Low to high</option>
          <option value="desc">High to low</option>
        </select>

        <input type="text" v-model="search" placeholder="Search assets..."/>
    </div>

    <loading-spinner v-if="editions.length === 0"></loading-spinner>

    <div v-if="editions">
      <section class="cards centered">
        <galleryEdition
          v-for="edition in editions"
          :edition="edition"
          :key="edition.edition">
        </galleryEdition>
      </section>
    </div>

  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import GalleryEdition from '../GalleryEdition';
  import LoadingSpinner from "../ui-controls/LoadingSpinner.vue";

  export default {
    name: 'gallery',
    components: {
      LoadingSpinner,
      GalleryEdition
    },
    data() {
      return {
        showSold: false,
        priceFilter: 'asc',
        search: ''
      };
    },
    methods: {
      onSoldToggleChanged: function ({value}) {
        this.showSold = value;
      }
    },
    computed: {
      ...mapState([
        'editionSummary'
      ]),
      editions: function () {

        return this.$store.getters.editionSummaryFilter(this.showSold, this.priceFilter)
          .filter(function (item) {

            if (this.search.length === 0) {
              return true;
            }

            let matchesName = item.artworkName.toLowerCase().indexOf(this.search.toLowerCase()) >= 0;
            let matchesDescription = item.description.toLowerCase().indexOf(this.search.toLowerCase()) >= 0;

            return matchesName || matchesDescription;
          }.bind(this));
      },
    }
  };
</script>

<style scoped>
  .filters {
    padding-left: 25px;
    padding-bottom: 20px;
  }
</style>
