<template>
  <div>
    <address-icon :eth-address="account"></address-icon>
    <span class="badge badge-primary" v-if="totalPurchases() > 0 ">{{ totalPurchases() }}</span>

    <code v-if="!account" class="mt-2">
      Looks like we cant see your account, have you logged into your wallet yet? 🔐
    </code>
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import _ from 'lodash';
  import AddressIcon from "../generic/AddressIcon";

  export default {
    name: 'AccountProfile',
    components: {
      AddressIcon
    },
    data() {
      return {
        profile: null
      };
    },
    computed: {
      ...mapState([
        'account',
        'currentNetworkId',
      ]),
      ...mapGetters([
        'totalPurchases',
      ]),
    },
    methods: {},
    watch: {

    },
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card.scss';

</style>
