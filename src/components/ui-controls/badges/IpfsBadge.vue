<template>
     <span class="badge badge-pill badge-extra-data" v-if="edition.tokenUri">
       <a :href="edition.tokenUri" @click="onClick" target="_blank">
         <font-awesome-icon :icon="['fas', 'cube']"></font-awesome-icon> IPFS
       </a>
    </span>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    name: 'ipfsBadge',
    props: ['edition'],
    components: {
      FontAwesomeIcon
    },
    methods: {
      onClick() {
        this.$ga.event('badges', 'ipfs-link', 'open-ipfs-data');
      }
    }
  };
</script>

<style scoped lang="scss">

</style>
