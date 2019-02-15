<template>
  <span v-if="ethAddress">
    <img class="img-fluid icon-normal rounded-circle m-2" :src="createIcon"/>
    <clickable-address :eth-address="ethAddress"></clickable-address>
  </span>
</template>

<script>
  import {toDataUrl} from 'myetherwallet-blockies';
  import ClickableAddress from "./ClickableAddress";

  export default {
    name: 'addressIcon',
    components: {ClickableAddress},
    props: {
      ethAddress: {
        type: String
      }
    },
    computed: {
      createIcon: function () {
        return toDataUrl(this.ethAddress);
      }
    }
  };
</script>

<style>
  .icon-normal {
    height: 32px;
    width: 32px;
  }
</style>
