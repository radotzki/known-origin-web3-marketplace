<template>
     <span class="badge badge-pill badge-extra-data" v-if="tokenId && link">
        <a :href="link" target="_blank">
         <font-awesome-icon :icon="['fas', 'receipt']"></font-awesome-icon> Receipt
        </a>
    </span>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import {mapGetters, mapState} from 'vuex';

  export default {
    components: {
      FontAwesomeIcon
    },
    name: 'PurchaseTransactionBadge',
    props: ['tokenId'],
    computed: {
      ...mapState([
        'etherscanBase',
      ]),
    },
    data() {
      return {
        link: null
      };
    },
    created() {
      this.$store.state.eventService
        .findPurchaseTransaction(this.tokenId)
        .then((data) => {
          if (!data) {
            return null;
          }
          this.link = `${this.etherscanBase}/tx/${data.transactionHash}`;
        });
    }
  };
</script>

<style scoped lang="scss">

</style>
