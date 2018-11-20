<template>
     <span class="badge badge-pill badge-extra-data" v-if="tokenId && link">
        <a :href="link" target="_blank">
         <font-awesome-icon :icon="['fas', 'shopping-cart']"></font-awesome-icon> Purchase
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
      this.$store.state.firestore
        .collection('raw')
        .doc(this.$store.state.firebasePath)
        .collection('koda-v2')
        .where('event', '==', 'Minted')
        .where("_args._tokenId", '==', this.tokenId.toString())
        .limit(1)
        .get()
        .then((querySet) => {
          console.log(this.tokenId);
          let data = null;
          querySet.forEach((doc) => {
            data = doc.data();
          });
          this.link = `${this.etherscanBase}/tx/${data.transactionHash}`;
        });
    }
  };
</script>

<style scoped lang="scss">

</style>
