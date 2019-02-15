<template>
  <div>
    <div class="row editions-wrap" v-if="accountFavorites && accountFavorites.length > 0">
      <div class="col-12">
        <h5 class="mb-3">Your Favorites</h5>
      </div>

      <div v-if="accountFavorites.length === 0">
        <code>No favorites found</code>
      </div>

      <div class="col-sm-3 mb-5"
           v-for="editionNumber in limitBy(accountFavorites, currentListLikes)"
           :key="editionNumber"
           v-if="assets[editionNumber] && assets[editionNumber].active">
        <gallery-card :edition="assets[editionNumber]" :edition-number="editionNumber">
        </gallery-card>
      </div>
    </div>

    <div class="row editions-wrap pt-1 pb-4" v-if="canShowMoreLikes">
      <div class="col-12 text-center">
        <button @click="showMoreLikes" class="btn btn-outline-primary mt-1 mb-5 ml-3 mr-3">
          Show more
        </button>
      </div>
    </div>
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import _ from 'lodash';
  import * as actions from '../../../store/actions';
  import {mapEvent, mapMobileEvent} from '../../../services/eventMapper';
  import GalleryCard from "../cards/GalleryCard";

  export default {
    name: 'accountFavorites',
    components: {
      GalleryCard,
    },
    data() {
      return {
        accountFavorites: null,
        currentListLikes: 20
      };
    },
    computed: {
      ...mapState([
        'account',
        'currentNetworkId',
      ]),
      ...mapState('kodaV2', [
        'assets',
      ]),
      canShowMoreLikes: function () {
        const totalAvailable = _.size(this.accountFavorites);
        if (totalAvailable === 0) {
          return false;
        }
        return totalAvailable > this.currentListLikes;
      }
    },
    methods: {
      mapEvent,
      mapMobileEvent,
      showMoreLikes: function () {
        this.currentListLikes = this.currentListLikes + 12;
        console.log(this.currentListLikes);
      },
    },
    async created() {
      const loadFavs = () => {
        if (this.$store.state.account && this.$store.state.currentNetworkId) {
          this.$store.state.likesService.getLikesForAccount(this.account)
            .then((accountFavorites) => {
              this.accountFavorites = accountFavorites;
              this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, this.accountFavorites);
            });
        }
      };

      this.$store.watch(() => this.$store.state.currentNetworkId, () => loadFavs());

      if (this.$store.state.account && this.$store.state.currentNetworkId) {
        loadFavs();
      }
    },
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card.scss';

</style>
