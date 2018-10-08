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
                v-bind:class="{'font-weight-bold': priceFilter === 'featured'}">Featured Artwork</span>
          <span @click="onSubFilter('artist')"
                class="sub-filter d-none d-md-inline"
                v-bind:class="{'font-weight-bold': priceFilter === 'artist'}">Featured Artist</span>
          <span @click="onSubFilter('asc')"
                class="sub-filter"
                v-bind:class="{'font-weight-bold': priceFilter === 'asc'}">Low - High</span>
          <span @click="onSubFilter('desc')"
                class="sub-filter d-none d-md-inline"
                v-bind:class="{'font-weight-bold': priceFilter === 'desc'}">High - Low</span>
        </p>
      </div>
    </div>

    <div class="container-fluid mt-4">

      <loading-section :page="PAGES.GALLERY"></loading-section>

      <div class="row editions-wrap">

        <div class="col-sm-3" v-if="priceFilter === 'artist'">
          <artist-panel :artist="findArtistsForAddress(featuredArtistAccount())"></artist-panel>
        </div>

        <div class="col-sm-9" v-if="priceFilter === 'artist'">
          <div class="card-deck">
            <div class="col-auto mx-auto mb-5" v-for="edition, editionNumber in editions" :key="editionNumber" v-if="edition.active">
              <router-link class="card-target"
                           :to="{ name: 'confirmPurchase', params: { artistAccount: edition.artistAccount, editionNumber: edition.edition }}">
                <div class="card shadow-sm">
                  <img class="card-img-top" :src="edition.lowResImg" :id="editionNumber"/>
                  <div class="high-res">
                    <high-res-label :high-res-available="edition.highResAvailable"></high-res-label>
                  </div>
                  <div class="card-body">
                    <p class="card-title">{{ edition.name }}</p>
                    <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
                    <a class="pl-1 artist-name">{{ findArtistsForAddress(edition.artistAccount).name | truncate(18) }}</a>
                  </div>
                  <div class="card-footer">
                    <div class="row">
                      <div class="col">
                        <availability :total-available="edition.totalAvailable" :total-supply="edition.totalSupply"></availability>
                      </div>
                      <div class="col text-right">{{ edition.priceInEther }} ETH</div>
                    </div>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- extract cards out to prevent duplication -->
        <div class="card-deck" v-else>
          <div class="col-auto mx-auto mb-5" v-for="edition, editionNumber in editions" :key="editionNumber" v-if="edition.active">
            <router-link class="card-target"
                         :to="{ name: 'confirmPurchase', params: { artistAccount: edition.artistAccount, editionNumber: edition.edition }}">
              <div class="card shadow-sm">
                <img class="card-img-top" :src="edition.lowResImg" :id="editionNumber"/>
                <div class="high-res">
                  <high-res-label :high-res-available="edition.highResAvailable"></high-res-label>
                </div>
                <div class="card-body">
                  <p class="card-title">{{ edition.name }}</p>
                  <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
                  <a class="pl-1 artist-name">{{ findArtistsForAddress(edition.artistAccount).name | truncate(18) }}</a>
                </div>
                <div class="card-footer">
                  <div class="row">
                    <div class="col">
                      <availability :total-available="edition.totalAvailable" :total-supply="edition.totalSupply"></availability>
                    </div>
                    <div class="col text-right">{{ edition.priceInEther }} ETH</div>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
<script>

  import _ from 'lodash';
  import { mapGetters, mapState } from 'vuex';
  import ArtistPanel from '../ui-controls/artist/ArtistPanel';
  import ClickableAddress from '../ui-controls/generic/ClickableAddress';
  import * as actions from '../../store/actions';
  import { PAGES } from '../../store/loadingPageState';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import Availability from '../ui-controls/v2/Availability';
  import HighResLabel from '../ui-controls/generic/HighResLabel';

  export default {
    name: 'galleryKODAV2',
    components: {
      LoadingSection,
      Availability,
      ClickableAddress,
      ArtistPanel,
      HighResLabel
    },
    data () {
      return {
        PAGES,
        priceFilter: 'featured'
      };
    },
    methods: {
      onSubFilter: function (value) {
        this.priceFilter = value;
      },
      goToArtist: function (artistAccount) {
        this.$router.push({name: 'artist-v2', params: {artistAccount}});
      }
    },
    computed: {
      ...mapGetters('kodaV2', [
        'filterEditions',
        'featuredArtistAccount'
      ]),
      ...mapGetters([
        'findArtistsForAddress'
      ]),
      editions: function () {
        return this.filterEditions(this.priceFilter);
      }
    },
    created () {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.GALLERY);

      const loadData = function () {
        this.$store.dispatch(`kodaV2/${actions.LOAD_FEATURED_EDITIONS}`)
          .then(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.GALLERY);

            setTimeout(function () {
              this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS_FOR_TYPE}`, {editionType: 1});
            }.bind(this), 3000);
          });
      }.bind(this);

      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        () => loadData()
      );

      if (this.$store.state.KnownOriginDigitalAssetV2) {
        loadData();
      }
    },
    destroyed () {
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
    .full-banner {
      font-size: 1.5rem;
    }

    .sub-filter {
      padding-left: 0.7rem;
      padding-right: 0.7rem;
    }
  }

  .high-res {
    position: absolute;
    top: -4px;
    opacity: 0.9;
  }

  @import '../../ko-card.scss';
</style>
