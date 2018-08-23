<template>
  <div>

    <loading-section :page="PAGES.ARTISTS"></loading-section>

    <artist-short-bio :artist="lookupArtist()"></artist-short-bio>

    <div class="container-fluid mt-4">

      <div class="row editions-wrap">
        <div class="card-deck">
          <div class="col-auto mx-auto mb-5" v-for="edition, editionNumber in editions">
            <div class="card-target">
              <router-link class="card-target"
                           :to="{ name: 'confirmPurchaseV2', params: { artistAccount: edition.artistAccount, editionNumber: edition.edition }}">
                <div class="card shadow-sm">
                  <img class="card-img-top" :src="edition.lowResImg"/>
                  <div class="card-body">
                    <p class="card-title">{{ edition.otherMeta.artworkName }}</p>
                    <img :src="findArtistsForAddress(edition.artistAccount).img" class="artist-avatar"/>
                    <span class="pl-1 artist-name" v-on:click="goToArtist(edition.artistAccount)">{{ edition.otherMeta.artist }}</span>

                    <small class="text-danger" v-if="isStartDateInTheFuture(edition)">
                      <span>Available {{ edition.startDate | moment("from") }}</span>
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

  import {mapGetters, mapState} from 'vuex';
  import ArtistShortBio from '../ui-controls/ArtistShortBio';
  import LoadingSpinner from '../ui-controls/LoadingSpinner';
  import * as actions from '../../store/actions';
  import GalleryEdition from '../GalleryEdition';
  import RarityIndicator from "../ui-controls/RarityIndicatorV2";
  import MetadataAttributes from "../ui-controls/MetadataAttributesV2";
  import TweetEditionButton from "../ui-controls/TweetEditionButton";
  import HighResLabel from "../ui-controls/HighResLabelV2";
  import {PAGES} from '../../store/loadingPageState';
  import LoadingSection from "../ui-controls/LoadingSection";

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
      LoadingSpinner
    },
    computed: {
      ...mapGetters([
        'findArtistsForAddress',
      ]),
      ...mapGetters('v2', [
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
      }
    },
    mounted: function () {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ARTISTS);

      const loadData = function () {
        this.$store.dispatch(`v2/${actions.LOAD_EDITIONS_FOR_ARTIST}`, {artistAccount: this.$route.params.artistAccount})
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
    }
  };
</script>

<!-- TODO EXTRACT SASS & COMPONENT -->

<style scoped lang="scss">
  .full-banner {
    p {
      margin-bottom: 0;
    }
  }

  .full-banner-secondary {

  }

  @import '../../ko-card.scss';
</style>
