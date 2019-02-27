<template>
  <div class="container-fluid d-none d-md-block">

    <div class="editions-wrap pt-2">
      <h3>
        Manage your Profile
      </h3>
    </div>

    <!--{{form}}-->
    <!--{{errors}}-->
    <!--{{formIsValid()}}-->

    <div class="row">
      <div class="col-sm-8">
        <div class="pb-4" v-if="artist">
          <form>

            <div class="form-group">
              <label for="nameInput">Name</label>
              <input type="text" class="form-control" id="nameInput" aria-describedby="nameHelp"
                     placeholder="Enter name" maxlength="75" minlength="4"
                     v-model="form.name"
                     @input="validateName"
                     :class="{ 'is-invalid': errors.name }">
              <small id="nameInputHelp" class="form-text text-muted">
                {{75 - form.name.length}} characters left
              </small>
            </div>

            <div class="form-group">
              <label for="profileImageInput">Profile Image</label>

              <div class="custom-file">
                <input id="profileImageInput"
                       type="file"
                       class="custom-file-input"
                       @change="captureProfileImage">
                <label class="custom-file-label" for="profileImageInput">
                  Select a new profile
                </label>
              </div>
              <small id="profileImageInputHelp" class="form-text text-muted">
                Max 250KB - image will be cropped and rounded to 75px * 75px
              </small>

              <div class="small pt-1">
                <span v-if="profile.status === 0" class="text-info">
                  Uploading new profile picture
                </span>
                <span v-if="profile.status === 1" class="text-info">
                  Saving to IPFS
                </span>
                <span v-if="profile.status === 2" class="text-success">
                  Successfully saved to IPFS <a target="_blank" :href="form.logo">[view]</a>
                </span>
                <span v-if="profile.status === 3" class="text-danger">
                  Failed to upload <span v-if="profile.exceedsMaxSize">(Max size 250kb)</span>
                </span>
              </div>

            </div>

            <div class="form-group">
              <label for="shortDescriptionInput">Short bio</label>
              <input type="text" class="form-control" id="shortDescriptionInput" placeholder="Summary..."
                     maxlength="150" minlength="25"
                     v-model="form.shortDescription"
                     @input="validateShortDescription"
                     :class="{ 'is-invalid': errors.shortDescription }">
              <small id="shortDescriptionInputHelp" class="form-text text-muted">
                {{150 - (form.shortDescription || '').length}} characters left
              </small>
            </div>

            <div class="form-group">
              <label for="bioInput">Bio</label>
              <textarea class="form-control" id="bioInput" placeholder="Bio..." maxlength="500" minlength="25" rows="4"
                        v-model="form.bio"
                        @input="validateBio"
                        :class="{ 'is-invalid': errors.bio }">
              </textarea>
              <small id="bioInputHelp" class="form-text text-muted">
                {{500 - form.bio.length}} characters left
              </small>
            </div>

            <div class="row">
              <div class="col">
                <div class="form-group">
                  <label for="websiteInput">Website</label>
                  <input type="url" class="form-control" id="websiteInput" placeholder="http://..."
                         v-model="form.website"
                         @input="validateWebsite"
                         :class="{ 'is-invalid': errors.website }">
                  <div class="invalid-feedback">
                    Invalid website
                  </div>
                </div>
              </div>
              <div class="col">
                <div class="form-group">
                  <label for="twitterInput">Twitter</label>
                  <input type="text" class="form-control" id="twitterInput" placeholder="@" minlength="2" maxlength="50"
                         v-model="form.twitter"
                         @input="validateTwitter"
                         :class="{ 'is-invalid': errors.twitter }">
                  <div class="invalid-feedback">
                    Invalid twitter username
                  </div>
                </div>
              </div>
              <div class="col">
                <div class="form-group">
                  <label for="instagramInput">Instagram</label>
                  <input type="text" class="form-control" id="instagramInput" minlength="1" maxlength="30"
                         v-model="form.instagram"
                         @input="validateInstagram"
                         :class="{ 'is-invalid': errors.instagram }">
                  <div class="invalid-feedback">
                    Invalid instagram username
                  </div>
                </div>
              </div>
            </div>

            <button type="button" class="btn btn-outline-primary"
                    :disabled="!formIsValid()"
                    @click="updateData">
              Update
            </button>

            <span v-if="state.triggered" class="pl-2 small text-info">
              Saving profile
            </span>
            <span v-if="state.success" class="pl-2 small text-success">
              Profile updated
            </span>
            <span v-if="state.failure" class="pl-2 small text-danger">
                Something sent wrong - reach us on
                <a href="https://t.me/knownorigin_io" target="_blank" title="Telegram">telegram</a> or
                <a href="mailto:hello@knownorigin.io" target="_blank" title="Mail">email</a>
            </span>
          </form>
        </div>
      </div>
      <div class="col-sm-4">
        <h4>Preview</h4>
        <artist-panel :artist="sampleArtist"></artist-panel>
      </div>
    </div>

  </div>
</template>

<script>
  import {mapState} from 'vuex';
  import _ from 'lodash';
  import urlRegex from 'url-regex';
  import * as actions from '../../../../store/actions';
  import ArtistPanel from '../ArtistPanel';
  import IPFS from 'ipfs-api';

  const ipfs = IPFS('ipfs.infura.io', '5001', {protocol: 'https'});

  const STATUS_INITIAL = 0;
  const STATUS_SAVING = 1;
  const STATUS_SUCCESS = 2;
  const STATUS_FAILED = 3;

  export default {
    name: 'artistDataControlPanel',
    props: ['artist'],
    components: {ArtistPanel},
    data() {
      return {
        // eslint-disable-next-line
        EMAIL_REGEX: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/,
        form: {},
        errors: {},
        profile: {
          exceedsMaxSize: false,
          status: null,
          error: null,
        },
        state: {
          triggered: false,
          success: false,
          failure: null
        }
      };
    },
    computed: {
      ...mapState([
        'account',
      ]),
      sampleArtist() {
        return _.merge({}, this.artist, {
          ...this.form
        });
      },
    },
    methods: {
      validMinMaxLength(event, field) {
        const size = _.trim(event.target.value.length);
        if (size >= event.target.minLength && size <= event.target.maxLength) {
          return true;
        }
        this.errors[field] = true;
        return false;
      },
      validateName(event) {
        if (this.validMinMaxLength(event, 'name')) {
          this.errors.name = false;
          return true;
        }
      },
      validateShortDescription(event) {
        if (this.validMinMaxLength(event, 'shortDescription')) {
          this.errors.shortDescription = false;
          return true;
        }
      },
      validateBio(event) {
        if (this.validMinMaxLength(event, 'bio')) {
          this.errors.bio = false;
          return true;
        }
      },
      validateWebsite(event) {
        const value = _.trim(event.target.value);
        if (value === '') {
          this.errors.website = false;
          return true;
        }
        this.errors.website = !urlRegex({exact: true}).test(value);
      },
      validateInstagram(event) {
        const value = _.trim(event.target.value);
        if (value === '') {
          this.errors.instagram = false;
          return true;
        }
        if (this.validMinMaxLength(event, 'instagram')) {
          this.errors.instagram = false;
          return true;
        }
      },
      validateTwitter(event) {
        const value = _.trim(event.target.value);
        if (value === '') {
          this.errors.twitter = false;
          return true;
        }
        if (value.substr(0, 1) !== '@') {
          this.errors.twitter = true;
          return false;
        }
        if (this.validMinMaxLength(event, 'twitter')) {
          this.errors.twitter = false;
          return true;
        }
      },
      formIsValid() {
        if (_.size(this.errors) === 0) {
          return true;
        }
        return _.every(this.errors, (value) => {
          return !value;
        });
      },
      captureProfileImage(event) {
        event.stopPropagation();
        event.preventDefault();
        this.profile.exceedsMaxSize = false;
        this.profile.status = STATUS_INITIAL;
        const file = event.target.files[0];

        // validate file size
        if (file.size >= 1024 * 500) {
          this.profile.exceedsMaxSize = true;
          this.profile.status = STATUS_FAILED;
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => this.saveFileToIpfs(reader);
        reader.readAsArrayBuffer(file);
      },
      saveFileToIpfs(reader) {
        this.profile.status = STATUS_SAVING;
        const buffer = Buffer.from(reader.result);
        ipfs.add(buffer)
          .then((response) => {
            console.log(response);
            this.form.logo = `https://ipfs.infura.io/ipfs/${response[0].hash}`;
            this.profile.status = STATUS_SUCCESS;
          })
          .catch((error) => {
            this.profile.status = STATUS_FAILED;
            this.profile.error = error;
          });
      },
      updateData() {
        if (this.formIsValid()) {

          this.state = {
            triggered: true,
            success: false,
            failure: null
          };

          const data = {
            name: this.form.name,
            shortDescription: this.form.shortDescription,
            bio: this.form.bio,
            website: this.form.website,
            instagram: this.form.instagram,
            twitter: this.form.twitter,
          };

          // Only add logo if its valid
          if (this.form.logo) {
            data.logo = this.form.logo;
          }

          this.$store.dispatch(actions.UPDATE_ARTIST_DATA, data)
            .then((result) => {
              console.log('All done, force refresh your  browser to see the changes immediately', result);
              this.$store.dispatch(actions.LOAD_ARTISTS);
              this.state.triggered = false;
              this.state.success = true;
            })
            .catch((error) => {
              this.state.failure = error;
              this.state.success = false;
              console.log('Error', error);
            })
            .finally(() => {
              this.state.triggered = false;
            });
        }
      }
    },
    created() {
      this.form = _.clone(this.artist);
    }
  };
</script>

<style scoped lang="scss">

</style>
