<template>
     <span class="badge badge-pill badge-extra-data" v-if="edition">
        <a :href="link" target="_blank">
         <font-awesome-icon :icon="['fas', 'bolt']"></font-awesome-icon> Birth
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
    name: 'BirthTransactionLookup',
    props: ['edition'],
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
        .where('event', '==', 'EditionCreated')
        .where("_args._editionNumber", '==', this.edition.edition.toString())
        .limit(1)
        .get()
        .then((querySet) => {
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
