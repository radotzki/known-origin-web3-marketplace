<template>
  <div>
    <div class="row bg-secondary text-white full-banner">
      <div class="col text-center m-5">
        <p>Showcase and Discover Rare Digital Art</p>
      </div>
    </div>
    <div class="row bg-white full-banner-secondary pt-3">
      <div class="col text-center">
        <p>
          <span @click="onSubFilter('featured')"
                class="sub-filter"
                v-bind:class="{'font-weight-bold': priceFilter === 'featured'}">Featured Artists</span>
          <span @click="onSubFilter('asc')"
                class="sub-filter"
                v-bind:class="{'font-weight-bold': priceFilter === 'asc'}">Low - High</span>
          <span @click="onSubFilter('desc')"
                class="sub-filter d-none d-md-inline"
                v-bind:class="{'font-weight-bold': priceFilter === 'desc'}">High - Low</span>
          <span @click="onSubFilter('sold')"
                class="sub-filter d-none d-md-inline"
                v-bind:class="{'font-weight-bold': priceFilter === 'sold'}">Sold</span>
        </p>
      </div>
    </div>

    <div class="container-fluid mt-4">

      <!-- TODO loading -->

      <div class="row editions-wrap">
        <div class="card-deck">
          <div class="col-auto mx-auto mb-5" v-for="edition, editionNumber in editions">
            <div class="card-target">
              <div class="card shadow-sm">
                <router-link class="card-target"
                             :to="{ name: 'confirmPurchaseV2', params: { artistAccount: edition.artistAccount, editionNumber: edition.edition }}">
                  <img class="card-img-top" :src="edition.lowResImg"/>
                  <div class="card-body">
                    <p class="card-title">{{ edition.otherMeta.artworkName }}</p>
                    <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
                    <a class="pl-1 artist-name">{{ edition.otherMeta.artist }}</a>
                  </div>
                  <div class="card-footer">
                    <div class="row">
                      <div class="col">
                        {{ edition.totalAvailable }} available
                      </div>
                      <div class="col text-right">{{ edition.priceInEther }} ETH</div>
                    </div>
                  </div>
                </router-link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import GalleryEdition from '../GalleryEdition';
  import LoadingSpinner from '../ui-controls/LoadingSpinner.vue';
  import _ from 'lodash';
  import Available from '../ui-controls/Available.vue';
  import * as actions from '../../store/actions';

  export default {
    name: 'galleryKODAV2',
    components: {
      LoadingSpinner,
      GalleryEdition,
      Available
    },
    data() {
      return {
        priceFilter: 'featured'
      };
    },
    methods: {
      onSubFilter: function (value) {
        this.priceFilter = value;
      },
      goToArtist: function (artistAccount) {
        console.log(artistAccount);
        this.$router.push({name: 'artist-v2', params: {artistAccount}});
      }
    },
    computed: {
      ...mapGetters('v2', [
        'featuredEditions',
        'filterEditions'
      ]),
      ...mapGetters([
        'findArtistsForAddress'
      ]),
      editions: function () {
        return this.filterEditions(this.priceFilter);
      }
    },
    mounted: function () {
      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        (newValue, oldValue) => {
          if (newValue) {
            this.$store.dispatch(`v2/${actions.LOAD_FEATURED_EDITIONS}`)
              .then(() => {
                setTimeout(function () {
                  this.$store.dispatch(`v2/${actions.LOAD_EDITIONS_FOR_TYPE}`, {editionType: 1});
                }.bind(this), 3000);
              });
          }
        });


      if (this.$store.state.KnownOriginDigitalAssetV2) {
        this.$store.dispatch(`v2/${actions.LOAD_FEATURED_EDITIONS}`)
          .then(() => {
            setTimeout(function () {
              this.$store.dispatch(`v2/${actions.LOAD_EDITIONS_FOR_TYPE}`, {editionType: 1});
            }.bind(this), 3000);
          });
      }
    }
  };
</script>

<style scoped lang="scss">
  .full-banner {
    p {
      margin-bottom: 0;
    }
  }

  .full-banner-secondary {

  }

  .card-img-top {
    object-fit: cover;
    height: 12rem;
  }

  .card {
    width: 14rem;
    height: 21.5rem;
  }

  .card-title {
    font-size: 0.9rem;
  }

  .card-body {
    padding: 1rem;
  }

  .card-footer {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .card-target {
    color: inherit;
  }

  a:hover {
    text-decoration: none;
  }

  .sub-filter {
    cursor: pointer;
    padding-left: 3rem;
    padding-right: 3rem;
  }

  .editions-wrap {
    margin-left: 50px;
    margin-right: 50px;
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    .card-deck {
      flex-flow: row wrap;
    }

    .card-img-top {
      object-fit: cover;
      height: 15rem;
    }

    .card {
      width: 18.5rem;
      height: 25rem;
    }

    .full-banner {
      font-size: 1.5rem;
    }

    .sub-filter {
      padding-left: 0.7rem;
      padding-right: 0.7rem;
    }

    .editions-wrap {
      margin-left: -30px;
      margin-right: -30px;
    }
  }

  .artist-name {
    font-size: 0.75rem;
  }

  .artist-avatar {
    max-width: 30px;
  }
</style>
