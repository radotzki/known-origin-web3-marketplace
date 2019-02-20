<template>
  <div class="container-fluid">

    <h3>Edition Curation Tool</h3>

    <ul>
      <li>1. Fill in the all the details for your NFT</li>
      <li>2. Select the size of your edition
        <small>(historic sales point to a reduced scarcity selling for higher prices)</small>
      </li>
      <li>3. Upload a standard or lower resolution image, current max is 10mb
        <small>(a high-res version will be offered to owners of your NFT if you fill in the form below)</small>
      </li>
      <li>4. Submit the transaction and wait for it be mined to the blockchain
        <small>(after about 5 minutes your works will appear on the site)</small>
      </li>
    </ul>

    <hr/>

    <div class="row">
      <div class="col-12">
        <h6>NFT Details</h6>

        <form>
          <div class="form-group row">
            <label for="artworkName"
                   class="col-2 col-form-label">
              Name
            </label>
            <div class="col-10">
              <input type="text"
                     class="form-control"
                     id="artworkName"
                     v-model="edition.name"
                     maxlength="100"/>
              <small class="float-right form-text text-muted">{{(edition.name || '').length}}/100</small>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-2">
              <label for="editionDescription">
                Description
              </label>
            </div>
            <div class="col-10">
              <textarea class="form-control" id="editionDescription"
                        rows="3"
                        v-model="edition.description"
                        maxlength="1000">
              </textarea>
              <small class="float-right form-text text-muted">{{(edition.description || '').length}}/1000</small>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-2">
              <label for="metadataTags">Tags</label>
            </div>
            <div class="col-10">
              <multiselect
                id="metadataTags"
                :multiple="true"
                v-model="edition.tags"
                :close-on-select="false"
                :hide-selected="true"
                :limit="100"
                :taggable="true"
                @tag="addTag"
                :placeholder="'Add the tags which represent your NFT'"
                :options="tags">
              </multiselect>
              <small class="form-text text-muted">
                We've loaded in some commonly used tags but you can add your own
              </small>
            </div>
          </div>


          <div class="form-group row">

            <div class="col-2">
              <label for="editionSize">Edition Size</label>
            </div>
            <div class="col-5">
              <input type="number" class="form-control" id="editionSize" min="1" max="100"
                     v-model="edition.totalAvailable"
                     @keyup.up="setScarcity"
                     @keyup.down="setScarcity"
                     @blur="setScarcity"/>
            </div>

            <div class="col-5">

              <div class="input-group mb-1">
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
                <usd-price-per-ether class="float-right"></usd-price-per-ether>
              </div>
            </div>

          </div>

        </form>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <!-- FIXME once we have worked out how to handle high-res -->
        <!--<form>-->
        <!--<div class="form-group row">-->
        <!--<div class="col-2">-->
        <!--<label>High Res Download?</label>-->
        <!--</div>-->
        <!--<div class="col-10">-->
        <!--<div class="form-check">-->
        <!--<input class="form-check-input" type="radio" :value="true"-->
        <!--name="highResAvailable" id="noNighResAvailable"-->
        <!--v-model="edition.highResAvailable">-->
        <!--<label class="form-check-label" for="noNighResAvailable">-->
        <!--<strong>Yes</strong> - make the high resolution available to download once purchased-->
        <!--</label>-->
        <!--</div>-->
        <!--<div class="form-check">-->
        <!--<input class="form-check-input" type="radio" :value="false"-->
        <!--name="highResAvailable" id="yesHighResAvailable"-->
        <!--v-model="edition.highResAvailable">-->
        <!--<label class="form-check-label" for="yesHighResAvailable">-->
        <!--<strong>No</strong> - I dont want the high resolution version to be downloaded after purchase-->
        <!--</label>-->
        <!--</div>-->
        <!--</div>-->
        <!--</div>-->
        <!--</form>-->

        <div class="form-group">
          <label for="nftImageInput">Artwork Image</label>
          <div class="custom-file">
            <input id="nftImageInput"
                   type="file"
                   class="custom-file-input"
                   :disabled="isImgSaving"
                   @change="captureFile"
                   accept="image/*">
            <label class="custom-file-label" for="nftImageInput">
              Select NFT image...
            </label>
          </div>
          <small id="nftImageInputHint" class="form-text text-muted">
            Current max size is 10mb - support for jpeg, png, gif and svg's at present
          </small>

          <p v-if="imageUpload.fileFormatError" class="text-danger small">
            Invalid file format, supported extensions are <code>jpeg</code>, <code>png</code>, <code>gif</code>
            and <code>svg</code>
          </p>

          <p v-if="isImgInitial || isImgSaving" class="text-info small">
            Uploading file to
            <font-awesome-icon :icon="['fas', 'cube']"></font-awesome-icon>
            IPFS
          </p>

          <p v-if="isImgSuccess" class="text-success small">
            Successfully uploaded file to
            <font-awesome-icon :icon="['fas', 'cube']"></font-awesome-icon>
            IPFS
          </p>

          <p v-if="isImgSuccess">
            <a target="_blank" :href="imageUpload.ipfsImage">
              <img :src="imageUpload.ipfsImage" class="img-thumbnail" style="max-height: 200px"/>
            </a>
          </p>
          <p v-if="isImgFailed" class="text-warning small">
            Something went went, try again or contract the team on telegram:
            {{ imageUpload.uploadError }}
          </p>
        </div>

        <p>
          If you want to enable <span class="badge badge-success">high res</span> and <span class="badge badge-info">bidding</span>
          then fill in this
          <strong>form [TODO]</strong> and we'll and we'll enable this for you
        </p>

      </div>
    </div>

    <div class="row">
      <div class="col">
        <button class="btn btn-block btn-primary">
          Create Edition
        </button>
      </div>
    </div>

    <div class="row pt-3">
      <div class="col">
        <a class="hand-pointer small" @click="expandIpfsData = !expandIpfsData">IPFS Data</a>
        <pre v-show="expandIpfsData">{{generateIPFSData()}}</pre>
      </div>
    </div>

  </div>
</template>

<script>

  import Web3 from 'web3';
  import {mapGetters, mapState} from 'vuex';
  import * as actions from '../../../store/actions';
  import _ from 'lodash';
  import Multiselect from 'vue-multiselect';
  import tags from '../../../services/selfService/tags';
  import IPFS from 'ipfs-api';
  import UsdPricePerEther from "../generic/USDPricePerEther";

  const ipfs = IPFS('ipfs.infura.io', '5001', {protocol: 'https'});

  const STATUS_INITIAL = 0;
  const STATUS_SAVING = 1;
  const STATUS_SUCCESS = 2;
  const STATUS_FAILED = 3;

  export default {
    name: 'selfService',
    components: {
      UsdPricePerEther,
      Multiselect
    },
    data() {
      return {
        tags: _.orderBy(_.map(tags, _.toLowerCase)),
        // The form
        edition: {
          tags: [],
          external_uri: 'https://knownorigin.io',
          highResAvailable: false // FIXME hard code this to false until we know how to solve it
        },
        imageUpload: {
          ipfsImage: null,
          uploadError: null,
          fileFormatError: false,
          currentStatus: null,
        },
        expandIpfsData: false
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
      isImgInitial() {
        return this.imageUpload.currentStatus === STATUS_INITIAL;
      },
      isImgSaving() {
        return this.imageUpload.currentStatus === STATUS_SAVING;
      },
      isImgSuccess() {
        return this.imageUpload.currentStatus === STATUS_SUCCESS;
      },
      isImgFailed() {
        return this.imageUpload.currentStatus === STATUS_FAILED;
      }
    },
    methods: {
      setScarcity() {
        this.$nextTick(() => {
          const total = parseInt(this.edition.totalAvailable);
          if (total === 1) {
            this.edition.scarcity = 'ultrarare';
          } else if (total <= 10) {
            this.edition.scarcity = 'rare';
          } else {
            this.edition.scarcity = 'common';
          }
          this.$forceUpdate();
        });
      },
      addTag(newTag) {
        if (newTag !== 'high res') {
          this.edition.tags.push(newTag);
        }
      },
      usdPrice() {
        if (this.currentUsdPrice && this.edition.priceInEther) {
          let value = this.currentUsdPrice * this.edition.priceInEther;
          return value.toFixed(2);
        }
        return 0;
      },
      captureFile(event) {
        // TODO Validate Size
        event.stopPropagation();
        event.preventDefault();

        this.imageUpload.fileFormatError = false;
        this.imageUpload.currentStatus = STATUS_INITIAL;

        const file = event.target.files[0];
        // console.log(file);

        if (file.type === 'image/jpeg' || file.type === 'image/svg+xml' || file.type === 'image/gif' || file.type === 'image/png') {
          const reader = new FileReader();
          reader.onloadend = () => this.saveFileToIpfs(reader);
          reader.readAsArrayBuffer(file);
        } else {
          this.imageUpload.fileFormatError = true;
        }
      },
      saveFileToIpfs(reader) {
        this.imageUpload.currentStatus = STATUS_SAVING;
        const buffer = Buffer.from(reader.result);
        ipfs.add(buffer)
          .then((response) => {
            console.log(`Saved to IPFS - now pinning...`, response);
            return ipfs.pin.add(response[0].hash)
              .then((pinningResult) => {
                console.log(`Saved to IPFS - [${response[0].hash}]`, pinningResult);
                this.imageUpload.ipfsImage = `https://ipfs.infura.io/ipfs/${response[0].hash}`;
                this.imageUpload.currentStatus = STATUS_SUCCESS;
              });
          })
          .catch((error) => {
            this.imageUpload.currentStatus = STATUS_FAILED;
            this.imageUpload.uploadError = error;
          });
      },
      generateIPFSData() {
        const tags = _.clone(this.edition.tags);
        if (this.edition.highResAvailable) {
          tags.push('high res');
        }
        return {
          "name": this.edition.name,
          "description": this.edition.description,
          "attributes": {
            "artist": this.artist.name,
            "scarcity": this.edition.scarcity,
            "tags": tags
          },
          "external_uri": "https://knownorigin.io",
          "image": this.imageUpload.ipfsImage ? this.imageUpload.ipfsImage : ''
        };
      },
      createEdition() {
        // FIXME
        // validate size
        // sign txs
        // submit txs
        // show response
      }
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

  .hand-pointer {
    cursor: pointer;
  }

  .multiselect--active {
    z-index: 3;
  }
</style>
