<template>
  <div>
    <div class="row bg-secondary text-white full-banner">
      <div class="col text-center m-5">
        <artist-short-bio :artist="lookupArtist()"></artist-short-bio>
      </div>
    </div>

    <div class="container-fluid mt-4">

      <loading-section :page="PAGES.ARTISTS"></loading-section>

      <p class="m-5">
        {{ lookupArtist().strapline }}
        <br/>
        <clickable-address :eth-address="lookupArtist().ethAddress"></clickable-address>
      </p>

      <!--<small v-if="artist.ethAddress"><br/>-->
        <!--<clickable-address :eth-address="lookupArtist().ethAddress"></clickable-address>-->
      <!--</small>-->

      <div class="row editions-wrap">
        <div class="card-deck">
          <div class="col-auto mx-auto mb-5" v-for="edition, editionNumber in editions" :key="editionNumber" v-if="edition.active">
            <div class="card-target">
              <router-link class="card-target"
                           :to="{ name: 'confirmPurchase', params: { artistAccount: edition.artistAccount, editionNumber: edition.edition }}">
                <div class="card shadow-sm">
                  <img class="card-img-top" :src="edition.lowResImg" :id="editionNumber"/>
                  <div class="card-body">
                    <p class="card-title">{{ edition.name }}</p>
                    <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
                    <span class="pl-1 artist-name" v-on:click="goToArtist(edition.artistAccount)">{{ findArtistsForAddress(edition.artistAccount).name }}</span>

                    <small class="text-danger" v-if="isStartDateInTheFuture(edition)">
                      <span>Available {{ edition.startDate | moment('from') }}</span>
                    </small>

                  </div>
                  <div class="card-footer">
                    <div class="row">
                      <div class="col">
                        {{ edition.totalAvailable }} available
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

  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import ArtistShortBio from '../ui-controls/artist/ArtistShortBio';
  import LoadingSpinner from '../ui-controls/generic/LoadingSpinner';
  import * as actions from '../../store/actions';
  import GalleryEdition from '../ui-controls/cards/GalleryEdition';
  import RarityIndicator from '../ui-controls/v2/RarityIndicator';
  import MetadataAttributes from '../ui-controls/v2/MetadataAttributes';
  import TweetEditionButton from '../ui-controls/v2/TweetEditionButton';
  import HighResLabel from '../ui-controls/generic/HighResLabel';
  import { PAGES } from '../../store/loadingPageState';
  import LoadingSection from '../ui-controls/generic/LoadingSection';
  import ClickableAddress from '../ui-controls/generic/ClickableAddress';

  export default {
    name: 'artistPage',
    components: {
      LoadingSection,
      HighResLabel,
      TweetEditionButton,
      MetadataAttributes,
      RarityIndicator,
      ArtistShortBio,
      GalleryEdition,
      LoadingSpinner,
      ClickableAddress
    },
    data () {
      return {
        PAGES: PAGES
      };
    },
    computed: {
      ...mapGetters([
        'findArtistsForAddress',
      ]),
      ...mapGetters('kodaV2', [
        'editionsForArtist',
        'isStartDateInTheFuture'
      ]),
      editions: function () {
        return this.editionsForArtist(this.$route.params.artistAccount);
      }
    },
    methods: {
      lookupArtist: function () {
        return this.findArtistsForAddress(this.$route.params.artistAccount);
      },
      goToArtist: function (artistAccount) {
        this.$router.push({name: 'artist-v2', params: {artistAccount}});
      }
    },
    created () {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ARTISTS);

      const loadData = function () {
        this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS_FOR_ARTIST}`, {artistAccount: this.$route.params.artistAccount})
          .finally(() => {
            this.$store.dispatch(`loading/${actions.LOADING_FINISHED}`, PAGES.ARTISTS);
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

<!-- TODO EXTRACT SASS & COMPONENT -->

<style scoped lang="scss">

  .editions-wrap {
    margin-left: 50px;
    margin-right: 50px;
  }

  @import '../../ko-card.scss';
</style>
