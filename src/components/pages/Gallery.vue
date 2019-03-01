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

      <!--<loading-section :page="PAGES.GALLERY"></loading-section>-->

      <div class="row editions-wrap">
        <div class="card-deck">
          <div class="col-sm-3 mb-5"
               v-for="edition in editions" :key="edition.edition"
               v-if="edition.active">
            <gallery-card :edition="edition" :edition-number="edition.edition"></gallery-card>
          </div>
        </div>
      </div>

      <infinite-loading @infinite="showMore" v-if="canShowMore">
        <div slot="spinner">
          <font-awesome-icon :icon="['fas', 'spinner']" spin v-if="isLoading"></font-awesome-icon>
        </div>
        <div slot="no-more">Loaded all available editions</div>
      </infinite-loading>

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
  import InfiniteLoading from 'vue-infinite-loading';

  export default {
    name: 'galleryKODAV2',
    components: {
      GalleryCard,
      LoadingSection,
      FontAwesomeIcon,
      InfiniteLoading
    },
    data() {
      return {
        PAGES,
        order: 'asc',
        orderByFilter: 'priceInEther',
        limit: 16,
        offset: 0,
        totalAvailable: 0,
        isLoading: false,
        editions: []
      };
    },
    methods: {
      onSubFilter(value) {
        if (this.order !== value) {
          this.order = value;
          this.limit = 16;
          this.offset = 0;
          this.showMore();
        }
      },
      goToArtist(artistAccount) {
        this.$router.push({name: 'artist', params: {artistAccount}});
      },
      showMore($state) {
        this.isLoading = true;

        if (this.totalAvailable === 0 && this.offset === 0 || (this.totalAvailable > this.offset)) {
          this.$store.state.editionLookupService.getGalleryEditions(this.orderByFilter, this.order, this.offset, this.limit)
            .then((results) => {
              if (results.success) {
                const {data, totalAvailable, params} = results;
                const {limit, offset, orderBy, order} = params;

                this.order = order;
                this.limit = limit;
                this.offset = offset + limit;
                this.orderByFilter = orderBy;
                this.totalAvailable = totalAvailable;
                _.forEach(data, (result) => {
                  this.editions.push(result);
                });
              }
            })
            .then(() => {
              $state.loaded();
            })
            .finally(() => {
              this.isLoading = false;
            });
        } else {
          $state.complete();
        }
      },
      canShowMore() {
        const totalAvailable = this.totalAvailable;
        if (totalAvailable === 0) {
          return false;
        }
        return totalAvailable > (this.offset + this.limit);
      }
    },
    computed: {},
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
