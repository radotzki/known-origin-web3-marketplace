<template>
  <div class="container-fluid">

    <h3>Edition Creation Tool</h3>
    <p>
      How it works...
    </p>

    <div class="row">
      <div class="col-12">
        <form>

          <div class="form-group row">
            <label for="artworkName"
                   class="col-sm-2 col-form-label">
              Edition Title
            </label>
            <div class="col-sm-10">
              <input type="text"
                     class="form-control"
                     id="artworkName"
                     v-model="edition.name"/>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-2">
              <label for="editionDescription">
                Description
              </label>
            </div>
            <div class="col-sm-10">
             <textarea class="form-control" id="editionDescription" rows="3"
                       v-model="edition.description"></textarea>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-2">
              <label for="metadataTags">Tags</label>
            </div>
            <div class="col-sm-10">
              <multiselect
                id="metadataTags"
                :multiple="true"
                v-model="edition.tags"
                :close-on-select="false"
                :hide-selected="true"
                :taggable="true"
                @tag="addTag"
                :options="tags">
              </multiselect>
            </div>
          </div>


          <div class="form-group row">

            <div class="col-sm-2">
              <label for="totalAvailable">Quantity</label>
            </div>
            <div class="col-sm-5">
              <select class="form-control" id="totalAvailable"
                      v-model="edition.totalAvailable"
                      @change="setScarcity">
                <option v-for="available in totalAvailable">{{available}}</option>
              </select>
            </div>

            <div class="col-sm-5">

              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text">ETH</span>
                </div>

                <input type="number" class="form-control" id="priceInWei"
                       v-model="edition.priceInEther"/>

                <div class="input-group-append">
                  <span class="input-group-text">$</span>
                  <span class="input-group-text">{{usdPrice()}}</span>
                </div>
              </div>
              <div>
                <span>{{ edition.priceInEther}} ETH</span>
                <span class="float-right">USD @ {{currentUsdPrice}} p/eth</span>
              </div>
            </div>

          </div>

        </form>
      </div>
    </div>


    <hr/>

    <div class="row">

      <p>
        Upload image
      </p>

      <p>
        sign msg
      </p>

      <p>
        complete txs & submit to chain
      </p>

    </div>

  </div>
</template>

<script>

  import Web3 from 'web3';
  import {mapGetters, mapState} from 'vuex';
  import * as actions from '../../../store/actions';
  import {PAGES} from '../../../store/loadingPageState';
  import _ from 'lodash';
  import Multiselect from 'vue-multiselect';
  import tags from '../../../services/selfService/tags';
  import totalAvailable from '../../../services/selfService/totalAvailable';

  export default {
    name: 'selfService',
    components: {
      Multiselect
    },
    data() {
      return {
        totalAvailable,
        tags: _.orderBy(_.map(tags, _.toLowerCase)),
        PAGES: PAGES,
        // The form
        edition: {
          tags: [],
          external_uri: 'https://knownorigin.io'
        },

      };
    },
    props: ['artist'],
    computed: {
      ...mapState([
        'account',
        'currentUsdPrice',
      ]),
      ...mapGetters([
        'findArtistsForAddress',
      ]),
      ...mapGetters('kodaV2', [
        'editionsForArtist',
        'isStartDateInTheFuture'
      ]),
      ...mapState('artistControls', [
        'owner',
        'paused',
      ]),
    },
    methods: {
      setScarcity() {
        const total = parseInt(this.edition.totalAvailable);
        if (total === 1) {
          this.edition.scarcity = 'ultrarare';
        } else if (total <= 10) {
          this.edition.scarcity = 'rare';
        } else {
          this.edition.scarcity = 'common';
        }
      },
      addTag(newTag) {
        this.edition.tags.push(newTag);
      },
      usdPrice() {
        if (this.currentUsdPrice && this.edition.priceInEther) {
          let value = this.currentUsdPrice * this.edition.priceInEther;
          return value.toFixed(2);
        }
        return 0;
      },
    },
    created() {


    },
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card.scss';

</style>
