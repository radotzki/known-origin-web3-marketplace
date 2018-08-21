<template>
  <div>

    <!-- TODO loading -->

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

                    <span class="pl-1 artist-name">
                      <rarity-indicator :total-available="edition.totalAvailable"></rarity-indicator>
                    </span>

                    <span class="pl-1 artist-name">
                      <metadata-attributes :other-meta="edition.otherMeta"></metadata-attributes>
                    </span>

                    <high-res-label :asset="edition"></high-res-label>

                    <small class="text-danger" v-if="isStartDateInTheFuture(edition)">
                      <span>Available {{ edition.startDate | moment("from") }}</span>
                    </small>

                  </div>
                  <div class="card-footer">
                    <div class="row">
                      <div class="col">
                        {{ edition.totalAvailable }} available
                      </div>
                    </div>
                    <div class="row">
                      <div class="col">
                        <tweet-edition-button :edition="edition"></tweet-edition-button>
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

  export default {
    name: 'artistPage',
    components: {
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
      this.$store.watch(
        () => this.$store.state.KnownOriginDigitalAssetV2,
        function (newValue, oldValue) {
          this.$store.dispatch(`v2/${actions.LOAD_EDITIONS_FOR_ARTIST}`, {artistAccount: this.$route.params.artistAccount});
        }.bind(this));
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
