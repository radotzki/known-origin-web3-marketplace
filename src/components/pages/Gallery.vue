<template>
  <div>
    <div class="row bg-primary full-banner-secondary pt-3 mt-1">
      <div class="col text-center">
        <p>
          <span @click="onSubFilter('asc')"
                class="sub-filter"
                v-bind:class="{'font-weight-bold': order === 'asc'}">Low - High</span>
          <span @click="onSubFilter('desc')"
                class="sub-filter d-md-inline"
                v-bind:class="{'font-weight-bold': order === 'desc'}">High - Low</span>
        </p>
      </div>
    </div>

    <div class="container-fluid mt-4">

      <loading-section :page="PAGES.GALLERY"></loading-section>

      <div class="row editions-wrap">
        <div class="card-deck">
          <div class="col-sm-3 mb-5"
               v-for="edition in galleryEditions" :key="edition.edition"
               v-if="edition.active">
            <gallery-card :edition="edition" :edition-number="edition.edition"></gallery-card>
          </div>
        </div>
      </div>

      <div class="row editions-wrap pt-1 pb-4" v-if="canShowMore">
        <div class="col-12 text-center">
          <button @click="showMore" class="btn btn-outline-primary">
            <font-awesome-icon :icon="['fas', 'spinner']" spin v-if="isLoading"></font-awesome-icon>
            <span v-if="!isLoading">Show more</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

  import _ from 'lodash';
  import {mapGetters, mapState} from 'vuex';
  import * as actions from '../../store/actions';
  import {PAGES} from '../../store/loadingPageState';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import GalleryCard from '../ui-controls/cards/GalleryCard';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    name: 'galleryKODAV2',
    components: {
      GalleryCard,
      LoadingSection,
      FontAwesomeIcon
    },
    data() {
      return {
        PAGES,
        order: 'asc',
        orderByFilter: 'priceInEther',
        limit: 20,
        offset: 0,
        isLoading: false
      };
    },
    methods: {
      onSubFilter: function (value) {
        if (this.order !== value) {
          // FIXME reset these when switching sort order - is there a better way?
          this.order = value;
          this.limit = 20;
          this.offset = 0;
          this.showMore();
        }
      },
      goToArtist: function (artistAccount) {
        this.$router.push({name: 'artist', params: {artistAccount}});
      },
      showMore: function () {
        this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.GALLERY);
        this.isLoading = true;
        this.offset = this.offset + 20;
        this.$store.dispatch(`kodaV2/${actions.LOAD_GALLERY_EDITIONS}`, {
          orderBy: this.orderByFilter,
          order: this.order,
          offset: this.offset,
          limit: this.limit,
        }).finally(() => {
          this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.GALLERY);
          this.isLoading = false;
        });
      },
    },
    computed: {
      ...mapState('kodaV2', [
        'galleryPagination',
        'galleryEditions',
      ]),
      canShowMore: function () {
        const totalAvailable = _.get(this.galleryPagination, 'totalAvailable', 0);
        const offset = _.get(this.galleryPagination, 'params.offset', 0);
        const limit = _.get(this.galleryPagination, 'params.limit', 0);
        if (totalAvailable === 0) {
          return false;
        }
        return totalAvailable > (offset + limit);
      }
    },
    created() {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.GALLERY);

      const loadApiData = () => {
        this.isLoading = true;
        this.$store.dispatch(`kodaV2/${actions.LOAD_GALLERY_EDITIONS}`, {
          orderBy: this.orderByFilter,
          order: this.order,
          offset: this.offset,
          limit: this.limit,
        })
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.GALLERY);
            this.isLoading = false;
          });
      };

      this.$store.watch(
        () => this.$store.state.editionLookupService.currentNetworkId,
        (newVal, oldVal) => {
          if (_.toString(newVal) !== _.toString(oldVal)) {
            // change detected, reloading gallery
            loadApiData();
          }
        }
      );

      if (this.$store.state.editionLookupService.currentNetworkId) {
        loadApiData();
      }
    },
    destroyed() {
    }
  };
</script>


<style scoped lang="scss">
  @import '../../ko-colours.scss';
  @import '../../ko-card.scss';

  .full-banner {
    p {
      margin-bottom: 0;
    }
  }

  .sub-filter {
    cursor: pointer;
    padding-left: 3rem;
    padding-right: 3rem;
    color: $body-bg;
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    .full-banner {
      font-size: 1.5rem;
    }

    .sub-filter {
      padding-left: 0.7rem;
      padding-right: 0.7rem;
    }
  }

  @import '../../ko-card.scss';
</style>
