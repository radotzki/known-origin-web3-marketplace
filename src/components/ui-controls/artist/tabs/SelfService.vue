<template>
  <div class="container-fluid">

    <div class="row pt-2">
      <div class="col">
        <h3>
          Add new artwork
        </h3>
        <div>
          Create and publish new artwork on KnownOrigin
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col">

        <fieldset :disabled="isMetadataSuccess || somethingInFlight">

          <form>
            <div class="form-group pt-3">
              <label for="artworkName">Artwork title</label>
              <input type="text"
                     class="form-control"
                     :class="{'is-valid':isNameValid}"
                     id="artworkName"
                     v-model="edition.name"
                     :maxlength="maxNameLength"
                     required/>
              <small class="form-text text-muted float-right">
                {{(edition.name || '').length}}/{{maxNameLength}}
              </small>
            </div>

            <div class="form-group pt-3">
              <label for="editionDescription">Artwork description</label>
              <textarea class="form-control"
                        :class="{'is-valid':isDescriptionValid}"
                        id="editionDescription"
                        rows="3"
                        v-model="edition.description"
                        :maxlength="maxDescriptionLength"
                        required>
              </textarea>
              <small class="form-text text-muted float-right">
                {{(edition.description || '').length}}/{{maxDescriptionLength}}
              </small>
            </div>

            <div class="form-group pt-3">
              <label for="editionSize">Edition size</label>
              <input type="number" class="form-control" id="editionSize" min="1" max="100"
                     v-model="edition.totalAvailable"
                     :class="{'is-valid':isTotalAvailableValid}"
                     @keyup.up="setScarcity"
                     @keyup.down="setScarcity"
                     @blur="setScarcity"
                     required/>
              <small class="form-text text-muted float-right">
                Current max edition size is <strong>100</strong>
              </small>
              <small class="form-text text-mute">
                Historic sales indicate that increasing scarcity can demand higher prices
              </small>
            </div>

            <div class="form-group pt-3">
              <label for="priceInWei">Price of artwork</label>
              <div class="input-group mb-1">
                <div class="input-group-prepend">
                  <span class="input-group-text">ETH</span>
                </div>
                <input type="number"
                       :class="{'is-valid':isPriceValid}"
                       class="form-control"
                       id="priceInWei"
                       v-model="edition.priceInEther"
                       placeholder="0.5..."
                       min="0"
                       required/>
                <div class="input-group-append">
                  <span class="input-group-text">$</span>
                  <span class="input-group-text">{{usdPrice()}}</span>
                </div>
              </div>
              <div>
                <usd-price-per-ether class="float-right"></usd-price-per-ether>
              </div>
            </div>

            <div class="form-group pt-3">
              <label for="metadataTags">Tags</label>
              <multiselect
                id="metadataTags"
                :multiple="true"
                v-model="edition.tags"
                :close-on-select="false"
                :hide-selected="true"
                :limit="100"
                :taggable="true"
                @tag="addTag"
                placeholder="Add the tags which represent your artwork"
                :options="tags">
              </multiselect>
              <small class="form-text text-muted float-right">
                Select suggested tags or add your own (min. 1)
              </small>
            </div>

            <div class="form-group pt-3">
              <label for="allowOffersToggle">Allow offers/bids</label>
              <div>
                <toggle-button
                  class="hand-pointer"
                  :value="true"
                  @change="edition.enableAuctions = $event.value"
                  :labels="{checked: 'Offers Accepted', unchecked: 'Buy Now Only'}"
                  :width="140"
                  :height="25"
                  :font-size="12"
                  id="allowOffersToggle">
                </toggle-button>
                <small class="form-text text-muted float-right">
                  All editions have a <strong>Buy Now</strong> price but
                  you can also <strong>Accept Offers</strong> on your work.
                </small>
              </div>
            </div>
          </form>
        </fieldset>
      </div>
    </div>

    <div class="row pt-2">
      <div class="col">

        <div class="form-group">
          <label for="nftImageInput">Upload image</label>
          <div class="custom-file">
            <input id="nftImageInput"
                   type="file"
                   class="custom-file-input"
                   :class="{'is-valid':isImageValid}"
                   :disabled="isImgSaving"
                   @change="captureFile"
                   accept="image/jpeg,image/png,image/gif"
                   required>
            <label class="custom-file-label" for="nftImageInput">
              Select NFT image...
            </label>
          </div>
          <div id="nftImageInputHint" class="form-text text-muted float-right small">
            Max file size <strong>{{maxFileSizeMb}}mb</strong>
            <span class="text-muted">(Accepted file types PNG, JPG & GIF)</span>
          </div>
        </div>

        <!-- Image upload errors and output -->
        <div class="form-group">

          <div v-if="imageUpload.fileFormatError" class="form-text text-danger small">
            Invalid file format, supported extensions are <code>jpeg</code>, <code>png</code>, <code>gif</code>
          </div>

          <div v-if="imageUpload.fileSizeError" class="form-text text-danger small">
            Max current file size supported it <strong>{{maxFileSizeMb}}mb</strong>
          </div>

          <div v-if="(isImgInitial || isImgSaving) && !(imageUpload.fileFormatError || imageUpload.fileSizeError)"
               class="form-text text-info small pb-3">
            Uploading file to
            <font-awesome-icon :icon="['fas', 'cube']"></font-awesome-icon>
            IPFS
            <font-awesome-icon :icon="['fas', 'spinner']" spin></font-awesome-icon>
          </div>

          <div v-if="isImgSuccess" class="form-text text-success small pb-3">
            Successfully uploaded file to
            <font-awesome-icon :icon="['fas', 'cube']"></font-awesome-icon>
            IPFS
          </div>

          <div v-if="isImgSuccess">
            <a target="_blank" :href="imageUpload.ipfsImage">
              <img v-lazy="imageUpload.ipfsImage"
                   class="img-thumbnail"
                   style="max-height: 200px"
                   alt="edition-image"/>
            </a>
          </div>

          <p v-if="imageUpload.uploadError" class="form-text text-warning small">
            Something went wrong, try again or contract the team on telegram<br/>
            {{ imageUpload.uploadError }}
          </p>
        </div>
      </div>
    </div>

    <div class="row pt-2">
      <div class="col">
        <div class="alert alert-info small">
          <div>
            Suggested formats
          </div>
          <div>
            <span class="font-weight-bold">Images:</span> 2880x1620 (max {{maxFileSizeMb}}mb)
          </div>
          <div>
            <span class="font-weight-bold">Animations:</span> 800x600 or 400x300 (max {{maxFileSizeMb}}mb)
          </div>
        </div>
      </div>
    </div>

    <div class="row pt-2">
      <div class="col">
        <div v-if="isMetadataInitial || isMetadataSaving" class="alert alert-secondary small" role="alert">
          Building edition ...
          <font-awesome-icon :icon="['fas', 'cube']" spin></font-awesome-icon>
        </div>

        <div v-if="isMetadataSuccess && !somethingInFlight" class="alert alert-info small" role="alert">
          <strong>Edition built</strong> submitting transaction to network, check your wallet
          <a v-if="false"
             :href="'https://ipfs.infura.io/ipfs/' + metadataIpfsUpload.ipfsHash"
             target="_blank">
            [data]
          </a>
        </div>

        <div v-if="isMetadataFailed" class="alert alert-warning small" role="alert">
          Something went wrong, try again or contract the team on telegram: {{ metadataIpfsUpload.uploadError }}
        </div>

        <div v-if="isSelfServiceTriggered(account)" class="alert alert-primary small" role="alert">
          Transaction initiated, please check your wallet.
          <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
        </div>

        <div v-if="isSelfServiceStarted(account)" class="alert alert-info small" role="alert">
          Your transaction is being confirmed...
          <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
          <br/>
          <clickable-transaction :transaction="getSelfServiceTransactionForAccount(account)"></clickable-transaction>
        </div>

        <div v-if="isSelfServiceSuccessful(account)" class="alert alert-success small" role="alert">
          <strong>Artwork created</strong> please wait approximately 5 minutes before it appears on the site.
          <br/>
          <clickable-transaction :transaction="getSelfServiceTransactionForAccount(account)"></clickable-transaction>
        </div>

        <div v-if="isSelfServiceFailed(account)" class="alert alert-warning small" role="alert">
          Something looks to have gone wrong.<br/>
          Please check your <a :href="etherscanAccountPage" target="_blank">account</a>
          <span v-if="getSelfServiceTransactionForAccount(account)">
              and view the transaction <clickable-transaction
            :transaction="getSelfServiceTransactionForAccount(account)"></clickable-transaction>
          </span>
          before trying again to prevent duplicate artwork listings.<br/>
          If you are stuck please reach out to the team on
          <a href="https://t.me/knownorigin_io" target="_blank">telegram</a> for assistance.
        </div>

      </div>
    </div>

    <div class="row pt-3">
      <div class="col">
        <button class="btn btn-block btn-success" disabled="disabled"
                v-if="isSelfServiceSuccessful(account)">
          Artwork created
        </button>
        <button class="btn btn-block btn-primary"
                :class="{'btn-secondary': !isEditionValid()}"
                v-if="!isSelfServiceSuccessful(account)"
                :disabled="!isEditionValid() || isMetadataSuccess || somethingInFlight"
                @click="createEdition">
          Add Artwork
        </button>
        <div class="pt-1 small text-muted">
          Your artwork should appear in approximately 5 minutes once the transaction is confirmed.
        </div>
      </div>
    </div>

    <div class="row pt-3">
      <div class="col small text-muted">
        <div>
          Once the artwork has been created you will have the option to provide a higher definition
          version which can be only by accessed from the buyer of the token.
        </div>
        <div class="pt-1">
          Token images are stored on a decentralised file store called
          <a href="https://ipfs.io" target="_blank">IPFS</a>
          <a class="hand-pointer" @click="expandIpfsData = !expandIpfsData">[Data]</a>
        </div>
      </div>
    </div>

    <div class="row pt-1" v-if="true">
      <div class="col small text-muted">
        <pre v-show="expandIpfsData">{{generateIPFSData()}}</pre>
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
  import ClickableTransaction from "../../generic/ClickableTransaction";

  const ipfs = IPFS('ipfs.infura.io', '5001', {protocol: 'https'});

  const STATUS_INITIAL = 0;
  const STATUS_SAVING = 1;
  const STATUS_SUCCESS = 2;
  const STATUS_FAILED = 3;

  export default {
    name: 'selfService',
    components: {
      ClickableTransaction,
      UsdPricePerEther,
      Multiselect,
      ToggleButton,
      FontAwesomeIcon
    },
    data() {
      return {
        tags: _.orderBy(_.map(tags, _.toLowerCase)),
        maxFileSizeMb: 25,
        maxNameLength: 100,
        maxDescriptionLength: 1000,
        // The form
        edition: {
          tags: [],
          external_uri: 'https://knownorigin.io',
          enableAuctions: true,
          priceInEther: null
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
        'etherscanBase',
        'currentUsdPrice',
      ]),
      ...mapGetters([
        'findArtistsForAddress',
      ]),
      ...mapGetters('kodaV2', [
        'editionsForArtist',
        'isStartDateInTheFuture'
      ]),
      ...mapGetters('selfService', [
        'isSelfServiceTriggered',
        'isSelfServiceStarted',
        'isSelfServiceSuccessful',
        'isSelfServiceFailed',
        'getSelfServiceTransactionForAccount',
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
      },
      somethingInFlight() {
        if (!this.account) {
          return true;
        }
        return this.isSelfServiceTriggered(this.account) || this.isSelfServiceStarted(this.account);
      },
      isNameValid() {
        if (_.size(_.trim(this.edition.name)) < 1 || _.size(_.trim(this.edition.name)) > this.maxNameLength) {
          console.log('Failed on [name] validation');
          return false;
        }
        return true;
      },
      isDescriptionValid() {
        if (_.size(_.trim(this.edition.description)) < 1 || _.size(_.trim(this.edition.description)) > this.maxDescriptionLength) {
          console.log('Failed on [description] validation');
          return false;
        }
        return true;
      },
      isTotalAvailableValid() {
        if (!this.edition.totalAvailable || this.edition.totalAvailable < 1 || this.edition.totalAvailable > 100) {
          console.log('Failed on [totalAvailable] validation');
          return false;
        }
        return true;
      },
      isArtistValid() {
        if (!this.artist) {
          console.log('Failed on [artist] validation');
          return false;
        }
        return true;
      },
      isScarcityValid() {
        if (['ultrarare', 'rare', 'common'].indexOf(this.edition.scarcity) < 0) {
          console.log('Failed on [scarcity] validation');
          return false;
        }
        return true;
      },
      isPriceValid() {
        console.log("this.edition.priceInEther", this.edition.priceInEther, this.edition.priceInEther === 0);
        if (_.toString(this.edition.priceInEther) === '0') {
          console.log("Price in ETH set to zero - passing validation");
          return true;
        }
        if (this.edition.priceInEther < 0.0001) {
          console.log('Failed on [priceInEther] validation');
          return false;
        }
        return true;
      },
      isImageValid() {
        if (_.size(this.imageUpload.ipfsHash) !== 46) {
          console.log('Failed on [ipfsHash] validation');
          return false;
        }
        return true;
      },
      isTagsValid() {
        if (this.edition.tags < 1 || this.edition.tags > 100) {
          console.log('Failed on [tags] validation');
          return false;
        }
        return true;
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
        this.edition.tags.push(newTag);
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

        this.imageUpload.ipfsHash = null;
        this.imageUpload.ipfsImage = null;

        const file = event.target.files[0];
        if (!file) {
          this.imageUpload.currentStatus = STATUS_FAILED;
          console.warn("No file found");
          return;
        }

        const isValidFileType = file.type === 'image/jpeg' || file.type === 'image/gif' || file.type === 'image/png';
        const fileSizeInMb = file.size / 1024 / 1024;
        const isValidFileSize = fileSizeInMb <= this.maxFileSizeMb;

        console.log("isValidFileSize", isValidFileSize);
        console.log("fileSizeInMb", fileSizeInMb);

        if (isValidFileType && isValidFileSize) {

          this.imageUpload.max = file.size;

          const reader = new FileReader();

          // Onload hook - upload & pin to IPFS
          reader.onloadend = () => {
            this.$store.state.notificationService.uploadToIPFS({type: "UPLOADING", id: 'ipfs-edition-upload'});
            this.imageUpload.currentStatus = STATUS_SAVING;
            this.imageUpload.ipfsHash = null;
            this.imageUpload.ipfsImage = null;

            const buffer = Buffer.from(reader.result);

            ipfs.add(buffer, {pin: true})
              .then((response) => {
                console.log(`Saved to IPFS`, response);
                this.imageUpload.ipfsHash = response[0].hash;
                this.imageUpload.ipfsImage = `https://ipfs.infura.io/ipfs/${response[0].hash}`;
                this.imageUpload.currentStatus = STATUS_SUCCESS;
                this.$store.state.notificationService.uploadToIPFS({type: "SUCCESS", id: 'ipfs-edition-upload'});
              })
              .catch((error) => {
                this.$store.state.notificationService.uploadToIPFS({type: "FAILED", id: 'ipfs-edition-upload'});
                this.imageUpload.currentStatus = STATUS_FAILED;
                this.imageUpload.uploadError = error;
              });
          };

          reader.readAsArrayBuffer(file);

        } else {
          this.imageUpload.fileFormatError = !isValidFileType;
          this.imageUpload.fileSizeError = !isValidFileSize;
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
        const isNameValid = this.isNameValid;
        if (!isNameValid) {
          return false;
        }
        const isDescriptionValid = this.isDescriptionValid;
        if (!isDescriptionValid) {
          return false;
        }
        const isTotalAvailableValid = this.isTotalAvailableValid;
        if (!isTotalAvailableValid) {
          return false;
        }
        const isArtistValid = this.isArtistValid;
        if (!isArtistValid) {
          return false;
        }
        const isScarcityValid = this.isScarcityValid;
        if (!isScarcityValid) {
          return false;
        }
        const isImageValid = this.isImageValid;
        if (!isImageValid) {
          return false;
        }
        const isTagsValid = this.isTagsValid;
        if (!isTagsValid) {
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
      },
      etherscanAccountPage() {
        return `${this.etherscanBase}/address/${this.account}`;
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
