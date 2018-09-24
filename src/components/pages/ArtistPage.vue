<template>
  <div>
    <div class="container-fluid mt-4">
      <div class="row editions-wrap">

        <div class="col-sm-3 side-banner">
          <div class="shadow-sm bg-white p-4 mb-5">
            <artist-short-bio :artist="lookupArtist()"></artist-short-bio>

            <div class="text-center mb-4">
              <button class="btn btn-sm mr-2 btn-twitter">Twitter</button>
              <button class="btn btn-sm btn-telegram">Telegram</button>
            </div>

            <h6>Artist Bio</h6>
            <p class="bio">
              {{ lookupArtist().strapline }}
            </p>
          </div>
        </div>

        <div class="col-sm-9">

          <loading-section :page="PAGES.ARTISTS"></loading-section>

          <div class="card-deck">
            <div class="col-auto mx-auto mb-5" v-for="edition, editionNumber in editions" :key="editionNumber"
                 v-if="edition.active">
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
                          <availability :total-available="edition.totalAvailable"
                                        :total-supply="edition.totalSupply"></availability>
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
  import Availability from '../ui-controls/v2/Availability';
  import _ from 'lodash';

  export default {
    name: 'artistPage',
    components: {
      Availability,
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
        return this.editionsForArtist(this.lookupArtist().ethAddress);
      }
    },
    methods: {
      lookupArtist: function () {
        return this.findArtistsForAddress(this.$route.params.artistAccount);
      },
      goToArtist: function (artistAccount) {
        this.$router.push({name: 'artist-v2', params: {artistAccount}});
      },
      getArtistAddress: function () {
        let artists = this.lookupArtist();
        if (_.isArray(artists.ethAddress)) {
          return artists.ethAddress[0];
        }
        return artists.ethAddress;
      }
    },
    created () {
      this.$store.dispatch(`loading/${actions.LOADING_STARTED}`, PAGES.ARTISTS);

      const loadData = function () {
        this.$store.dispatch(`kodaV2/${actions.LOAD_EDITIONS_FOR_ARTIST}`, {artistAccount: this.lookupArtist().ethAddress})
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

<style scoped lang="scss">
  @import '../../ko-colours.scss';

  .editions-wrap {
    margin-left: 50px;
    margin-right: 50px;
  }

  .side-banner {
    color: rgba(0, 0, 0, 0.03);
    /*background-image: url("../../../static/kodo_pattern.jpeg");*/
  }

  .bio {
    font-size: 0.75rem;
    color: $body-color;
  }

  h6 {
    color: $body-color;
  }

  .btn-twitter {
    background-color: #20a2eb;
    color: $body-bg;
  }

  .btn-telegram {
    background-color: #0088cc;
    color: $body-bg;
  }

  @import '../../ko-card.scss';
</style>
