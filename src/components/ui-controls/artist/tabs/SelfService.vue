<template>
  <div class="container-fluid">

    <div class="row">
      <div class="col-12">
        <h6>Edition Details</h6>

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
              <small class="form-text text-muted float-right">{{(edition.name || '').length}}/100</small>
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
              <small class="form-text text-muted float-right">{{(edition.description || '').length}}/1000</small>
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
              <small class="form-text text-muted float-right">
                We've loaded in some commonly used tags but you can add your own
              </small>
            </div>
          </div>

          <div class="form-group row">

            <div class="col-2">
              <label for="editionSize">Edition Size</label>
            </div>
            <div class="col-10">
              <input type="number" class="form-control" id="editionSize" min="1" max="100"
                     v-model="edition.totalAvailable"
                     @keyup.up="setScarcity"
                     @keyup.down="setScarcity"
                     @blur="setScarcity"/>
              <small class="form-text text-muted float-right">
                Current max edition size is <strong>100</strong>
              </small>
              <small class="form-text text-info">
                Historic sales point to increasing scarcity going for higher prices
              </small>
            </div>

          </div>

          <div class="form-group row">

            <div class="col-2">
              <label for="editionSize">Price</label>
            </div>

            <div class="col-10">

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


          <div class="form-group row">
            <div class="col-2">
              <label>Enable Offers</label>
            </div>
            <div class="col-10">
              <toggle-button
                class="hand-pointer"
                :value="true"
                @change="edition.enableAuctions = $event.value"
                :labels="{checked: 'Offers Accepted', unchecked: 'Buy Now Only'}"
                :width="140"
                :height="25"
                :font-size="12">
              </toggle-button>
              <small class="form-text text-muted float-right">
                All editions have a <strong>Buy Now</strong> price but
                you can also <strong>Accept Offers</strong> on your work.
              </small>
            </div>
          </div>


        </form>
      </div>
    </div>

    <div class="row">
      <div class="col-12">

        <div class="form-group row">

          <div class="col-2">
            <label for="nftImageInput">Artwork Image</label>
          </div>
          <div class="col-10">

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

            <div id="nftImageInputHint" class="form-text text-muted float-right small">
              Current max size is <strong>{{maxFileSizeMb}}mb</strong> - <code>jpeg</code>, <code>png</code>,
              <code>gif</code> & <code>svg</code>
            </div>

            <span v-if="imageUpload.fileFormatError" class="form-text text-danger small">
              Invalid file format, supported extensions are <code>jpeg</code>, <code>png</code>, <code>gif</code>
              & <code>svg</code>
            </span>

            <p v-if="imageUpload.isValidFileSize" class="form-text text-danger small">
              Max current file size supported it <strong>{{maxFileSizeMb}}mb</strong>
            </p>

            <p v-if="isImgInitial || isImgSaving" class="form-text text-info small">
              Uploading file to
              <font-awesome-icon :icon="['fas', 'cube']"></font-awesome-icon>
              IPFS
              <font-awesome-icon :icon="['fas', 'spinner']" spin></font-awesome-icon>
            </p>

            <p v-if="isImgSuccess" class="form-text text-success small">
              Successfully uploaded file to
              <font-awesome-icon :icon="['fas', 'cube']"></font-awesome-icon>
              IPFS
            </p>

            <p v-if="isImgSuccess">
              <a target="_blank" :href="imageUpload.ipfsImage">
                <img :src="imageUpload.ipfsImage" class="img-thumbnail" style="max-height: 200px"/>
              </a>
            </p>
            <p v-if="isImgFailed" class="form-text text-warning small">
              Something went went, try again or contract the team on telegram:
              {{ imageUpload.uploadError }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <button class="btn btn-block btn-primary" :disabled="!isEditionValid()" @click="createEdition">
          Create Edition
        </button>
        <small class="float-left form-text text-info">
          After about 5 minutes your works will appear on the site
        </small>
      </div>
    </div>

    <hr/>

    <div class="row">
      <div class="col">
        <p>
          Once your edition has been created you will be able to upload a <span class="badge badge-success">high definition</span>
          version up to 75mb which can be downloaded <strong>only</strong> by the buyers of your tokens.
        </p>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div v-if="isMetadataInitial || isMetadataSaving" class="text-info small">
          Building edition data
          <font-awesome-icon :icon="['fas', 'cube']" spin></font-awesome-icon>
        </div>
        <div v-if="isMetadataSuccess" class="text-success small">
          Edition data built <a :href="'https://ipfs.infura.io/ipfs/' + metadataIpfsUpload.ipfsHash" target="_blank">[data]</a>
        </div>
        <div v-if="isMetadataFailed" class="text-warning small">
          Something went went, try again or contract the team on telegram: {{ metadataIpfsUpload.uploadError }}
        </div>
        <span>
          <a class="hand-pointer small" @click="expandIpfsData = !expandIpfsData">(debug view)</a>
          <pre v-show="expandIpfsData">{{generateIPFSData()}}</pre>
        </span>
      </div>
    </div>


  </div>
</template>

<script>

  import Web3 from 'web3';
  import {mapGetters, mapState} from 'vuex';
  import * as actions from '../../../../store/actions';
  import _ from 'lodash';
  import Multiselect from 'vue-multiselect';
  import tags from '../../../../services/selfService/tags';
  import IPFS from 'ipfs-api';
  import UsdPricePerEther from "../../generic/USDPricePerEther";
  import {ToggleButton} from 'vue-js-toggle-button';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  const ipfs = IPFS('ipfs.infura.io', '5001', {protocol: 'https'});

  const STATUS_INITIAL = 0;
  const STATUS_SAVING = 1;
  const STATUS_SUCCESS = 2;
  const STATUS_FAILED = 3;

  export default {
    name: 'selfService',
    components: {
      UsdPricePerEther,
      Multiselect,
      ToggleButton,
      FontAwesomeIcon
    },
    data() {
      return {
        tags: _.orderBy(_.map(tags, _.toLowerCase)),
        maxFileSizeMb: 25,
        // The form
        edition: {
          tags: [],
          external_uri: 'https://knownorigin.io',
          highResAvailable: false, // FIXME hard code this to false until we know how to solve it
          enableAuctions: true
        },
        imageUpload: {
          ipfsImage: null,
          ipfsHash: null,
          uploadError: null,
          fileFormatError: false,
          isValidFileSize: false,
          currentStatus: null,
        },
        metadataIpfsUpload: {
          ipfsHash: null,
          uploadError: null,
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
      },
      isMetadataInitial() {
        return this.metadataIpfsUpload.currentStatus === STATUS_INITIAL;
      },
      isMetadataSaving() {
        return this.metadataIpfsUpload.currentStatus === STATUS_SAVING;
      },
      isMetadataSuccess() {
        return this.metadataIpfsUpload.currentStatus === STATUS_SUCCESS;
      },
      isMetadataFailed() {
        return this.metadataIpfsUpload.currentStatus === STATUS_FAILED;
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
        return 0.00;
      },
      captureFile(event) {
        event.stopPropagation();
        event.preventDefault();

        this.imageUpload.fileFormatError = false;
        this.imageUpload.fileSizeError = false;
        this.imageUpload.currentStatus = STATUS_INITIAL;

        const file = event.target.files[0];
        const isValidFileType = file.type === 'image/jpeg' || file.type === 'image/svg+xml' || file.type === 'image/gif' || file.type === 'image/png';
        const fileSizeInMb = file.size / 1024 / 1024;
        const isValidFileSize = fileSizeInMb <= this.maxFileSizeMb;

        if (isValidFileType && isValidFileSize) {

          this.imageUpload.max = file.size;

          const reader = new FileReader();

          // Onload hook - upload & pin to IPFS
          reader.onloadend = () => {
            this.imageUpload.currentStatus = STATUS_SAVING;
            this.imageUpload.ipfsHash = null;
            this.imageUpload.ipfsImage = null;

            const buffer = Buffer.from(reader.result);

            const options = {
              pin: true
            };

            ipfs.add(buffer, options)
              .then((response) => {
                console.log(`Saved to IPFS`, response);
                this.imageUpload.ipfsHash = response[0].hash;
                this.imageUpload.ipfsImage = `https://ipfs.infura.io/ipfs/${response[0].hash}`;
                this.imageUpload.currentStatus = STATUS_SUCCESS;
              })
              .catch((error) => {
                this.imageUpload.currentStatus = STATUS_FAILED;
                this.imageUpload.uploadError = error;
              });
          };

          reader.readAsArrayBuffer(file);

        } else {
          this.imageUpload.fileFormatError = isValidFileType;
          this.imageUpload.fileSizeError = isValidFileSize;
        }
      },
      uploadMetaData: function () {
        this.metadataIpfsUpload.currentStatus = STATUS_SAVING;
        this.metadataIpfsUpload.ipfsHash = null;

        const metadata = Buffer.from(JSON.stringify(this.generateIPFSData()));
        return ipfs.add(metadata, {pin: true})
          .then((response) => {
            console.log(response);
            this.metadataIpfsUpload.ipfsHash = response[0].hash;
            this.metadataIpfsUpload.currentStatus = STATUS_SUCCESS;
          })
          .catch((error) => {
            console.log(error);
            this.metadataIpfsUpload.currentStatus = STATUS_FAILED;
            this.metadataIpfsUpload.uploadError = error;
          });
      },
      generateIPFSData() {
        const tags = _.clone(this.edition.tags);
        if (this.edition.highResAvailable) {
          tags.push('high res');
        }
        return {
          "name": _.trim(this.edition.name),
          "description": _.trim(this.edition.description),
          "attributes": {
            "artist": this.artist.name,
            "scarcity": this.edition.scarcity,
            "tags": tags
          },
          "external_uri": "https://knownorigin.io",
          "image": this.imageUpload.ipfsImage ? this.imageUpload.ipfsImage : ''
        };
      },
      isEditionValid() {
        if (_.size(_.trim(this.edition.name)) < 1 || _.size(_.trim(this.edition.name)) > 100) {
          console.log('Failed on [name] validation');
          return false;
        }
        if (_.size(_.trim(this.edition.description)) < 1 || _.size(_.trim(this.edition.description)) > 1000) {
          console.log('Failed on [description] validation');
        }
        if (_.size(this.edition.totalAvailable) < 1 || _.size(this.edition.totalAvailable) > 100) {
          console.log('Failed on [totalAvailable] validation');
        }
        if (!this.artist) {
          console.log('Failed on [artist] validation');
          return false;
        }
        if (['ultrarare', 'rare', 'common'].indexOf(this.edition.scarcity) < 0) {
          console.log('Failed on [scarcity] validation');
          return false;
        }
        if (this.imageUpload.fileSizeError || this.imageUpload.fileFormatError) {
          console.log('Failed on [fileSizeError/fileFormatError] validation');
          return false;
        }
        if (_.size(this.imageUpload.ipfsHash) !== 46) {
          console.log('Failed on [ipfsHash] validation');
          return false;
        }
        if (this.edition.tags < 1) {
          console.log('Failed on [tags] validation');
          return false;
        }
        return true;
      },
      artistAddress() {
        const artist = this.artist;
        if (!artist) {
          return {};
        }
        if (_.isArray(artist.ethAddress)) {
          return artist.ethAddress[0];
        }
        return artist.ethAddress;
      },
      createEdition() {
        if (this.isEditionValid()) {
          this.uploadMetaData()
            .then(() => {
              this.$store.dispatch(`selfService/${actions.CREATE_SELF_SERVICE_EDITION}`, {
                artist: this.artistAddress(),
                totalAvailable: this.edition.totalAvailable,
                tokenUri: this.metadataIpfsUpload.ipfsHash,
                priceInWei: Web3.utils.toWei(this.edition.priceInEther, 'ether'),
                enableAuctions: this.edition.enableAuctions
              });
            });
        }
      }
    },
    created() {

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

  .multiselect--active {
    z-index: 3;
  }
</style>
