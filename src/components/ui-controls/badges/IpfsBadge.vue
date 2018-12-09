<template>
     <span class="badge badge-pill badge-extra-data" v-if="edition.tokenUri">
       <a :href="edition.tokenUri" target="_blank">
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
    }
  };
</script>

<style scoped lang="scss">

</style>
