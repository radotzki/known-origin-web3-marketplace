<template>
  <div class="container-fluid">

    <div class="pt-2">
      <h3>
        Your creations missing high-res
      </h3>
      <p>
        Upload a high resolution version of up to <strong>100mb</strong><br/>
        <span class="text-muted small">
        Only those who had purchased your work can download these assets.
        </span>
      </p>
    </div>

    <div class="row">
      <div class="col">
        <p class="alert alert-info">
          Coming soon....
        </p>
      </div>
    </div>

    <div class="row">
      <div class="col">

        <table class="table">
          <tbody>
          <tr v-for="edition in editionsMissingHighRes">
            <td class="w-10 text-right" width="100">
              <router-link
                :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: edition.edition }}">
                <edition-image class="img-thumbnail" :src="edition.lowResImg"/>
              </router-link>
            </td>
            <td class="align-middle">
              <div class="pb-2">
                {{edition.name}}
              </div>
              <div>
                <button class="btn btn-sm btn-primary" @click="addHighRes">Add missing high-res image</button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>

      </div>
    </div>

  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import * as actions from '../../../../store/actions';
  import _ from 'lodash';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import EditionImage from "../../generic/EditionImage";

  export default {
    name: 'AddHighRes',
    components: {
      EditionImage,
      FontAwesomeIcon
    },
    data() {
      return {
        editionsMissingHighRes: null
      };
    },
    props: ['artist'],
    computed: {
      ...mapState([
        'account',
      ]),
    },
    methods: {
      getArtistAddress(artist) {
        if (_.isArray(artist.ethAddress)) {
          return artist.ethAddress[0];
        }
        return artist.ethAddress;
      },
      addHighRes() {
        alert('TODO add a high-res file in some form?');
      }
    },
    async created() {

      const loadApiData = () => {
        this.$store.state.editionLookupService.getEditionsWithoutHighResForArtist(this.getArtistAddress(this.artist))
          .then((results) => {
            console.log(results);
            if (results.success) {
              const {data} = results;
              this.editionsMissingHighRes = data;
            }
          });
      };

      this.$store.watch(
        () => this.$store.state.editionLookupService.currentNetworkId,
        (newVal, oldVal) => {
          if (_.toString(newVal) !== _.toString(oldVal)) {
            loadApiData();
          }
        }
      );

      if (this.$store.state.eventService.currentNetworkId) {
        loadApiData();
      }
    },
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../../ko-colours';
  @import '../../../../ko-card';

  .hand-pointer {
    cursor: pointer;
  }

  .img-thumbnail {
    max-width: 75px;
  }

  .table {
    vertical-align: middle;
  }
</style>
