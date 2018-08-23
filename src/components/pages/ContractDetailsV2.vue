<template>
  <div class="container">
    <h1>Contract</h1>
    <div class="row justify-content-center mt-4">
      <div class="col-sm-6 text-center">
        <h2>KODA V1</h2>
        <clickable-address :eth-address="contractAddress"></clickable-address>
      </div>
      <div class="col-sm-6 text-center">
        <h2>KODA V2</h2>
        <clickable-address :eth-address="contractAddressV2"></clickable-address>
      </div>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import ClickableAddress from '../ui-controls/ClickableAddress';

  export default {
    name: 'contractDetails',
    components: {ClickableAddress},
    computed: {
      ...mapState('contract', [
        'contractAddress',
        'contractAddressV2'
      ])
    }
  };
</script>

<style scoped>
</style>
