<template>
  <div v-if="shouldDisplayHighRes()" class="btn-block">

    <!-- FIXME - We have an API to check number of times downloaded, should we display this information? -->

    <!-- Initial download button -->
    <a class="btn btn-success btn-block text-white"
       v-if="!isHighResDownloadTriggered(asset.id) && !isHighResDownloadSuccess(asset.id) && !isHighResDownloadFailed(asset.id)"
       @click="verifyPurchase">
      <font-awesome-icon :icon="['fas', 'check']"></font-awesome-icon>
      High-res asset available
    </a>

    <!-- Triggered -->
    <a class="btn btn-success btn-block text-white"
       v-if="isHighResDownloadTriggered(asset.id) && !isHighResDownloadFailed(asset.id)"
       @click="noop">
      <font-awesome-icon :icon="['fas', 'cog']" spin></font-awesome-icon>
      In progress
    </a>

    <!-- Success -->
    <span v-if="isHighResDownloadSuccess(asset.id)">
      <a class="btn btn-success btn-block text-white"
         :href="getHighResDownloadedLink(asset.id)" target="_blank">
        <font-awesome-icon :icon="['fas', 'download']"></font-awesome-icon> Download high-res
      </a>
      <small class="text-muted">This download will expire in approximately 10 minutes and you can download the file a maximum of 3 times.</small>
    </span>

    <!-- FIXME - should we display the error message here, it is available to us? -->
    <!-- Failure -->
    <span v-if="isHighResDownloadFailed(asset.id)">
      <a class="btn btn-danger btn-block text-white"
         @click="noop">
         <font-awesome-icon :icon="['fas', 'times']"></font-awesome-icon> Something went wrong
      </a>
      <small class="text-muted">
        Please contact us on
        <a href="https://t.me/knownorigin_io" target="_blank" class="community-icon" title="Telegram">telegram</a>
        or
        <a href="mailto:hello@knownorigin.io" target="_blank" title="Hello">email</a> if you think this is incorrect.
      </small>
    </span>

  </div>
</template>

<script>
  /* global web3:true */
  import * as actions from '../../store/actions';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import {mapGetters, mapState} from 'vuex';

  export default {
    name: 'highResDownload',
    components: {FontAwesomeIcon},
    props: ['asset'],
    computed: {
      ...mapState([
        'account',
      ]),
      ...mapGetters([
        'isHighResDownloadTriggered',
        'isHighResDownloadSuccess',
        'isHighResDownloadFailed',
        'getHighResDownloadedLink'
      ]),
    },
    methods: {
      verifyPurchase: function () {
        this.$store.dispatch(actions.HIGH_RES_DOWNLOAD, this.asset);
      },
      shouldDisplayHighRes: function () {
        return (this.asset && this.account) && this.asset.highResAvailable && (this.asset.owner.toLowerCase() === this.account.toLowerCase());
      },
      noop: () => {}
    }
  };
</script>

<style>
</style>
