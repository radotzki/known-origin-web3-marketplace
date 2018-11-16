<template>
     <span class="badge badge-pill badge-extra-data">
       <a href="https://erc721.org" target="_blank">
         <font-awesome-icon :icon="['fab', 'ethereum']"></font-awesome-icon> ERC721
       </a>
    </span>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    name: 'ERC721Badge',
    components: {
      FontAwesomeIcon
    },
  };
</script>

<style scoped lang="scss">

</style>
