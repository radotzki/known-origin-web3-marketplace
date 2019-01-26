<template>
     <span class="badge badge-pill badge-extra-data" v-if="edition">
        <a :href="link" target="_blank">
         <font-awesome-icon :icon="['fas', 'bolt']"></font-awesome-icon> Creation
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
    name: 'BirthTransactionBadge',
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
      if (this.$store.state.eventService) {
        this.$store.state.eventService
          .findBirthTransaction(this.edition)
          .then((data) => {
            this.link = `${this.etherscanBase}/tx/${data.transactionHash}`;
          });
      }
    }
  };
</script>

<style scoped lang="scss">

</style>
