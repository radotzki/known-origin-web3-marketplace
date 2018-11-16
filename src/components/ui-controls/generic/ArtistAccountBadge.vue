<template>
     <span class="badge badge-pill badge-extra-data"
           v-if="edition.artistAccount" style="height: 20px">
        <a :href="buildLink" target="_blank">
          <font-awesome-icon :icon="['fas', 'palette']"></font-awesome-icon> Creator
        </a>
    </span>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import ClickableAddress from "./ClickableAddress";
  import {mapGetters, mapState} from 'vuex';

  export default {
    components: {
      ClickableAddress,
      FontAwesomeIcon
    },
    name: 'ArtistAccountBadge',
    props: ['edition'],
    computed: {
      ...mapState([
        'etherscanBase',
      ]),
      buildLink: function () {
        return `${this.etherscanBase}/address/${this.edition.artistAccount}`;
      }
    }
  };
</script>

<style scoped lang="scss">

</style>
