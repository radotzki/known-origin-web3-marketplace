<template>
     <span class="badge badge-pill badge-extra-data" v-if="edition.tokenUri">
      <img src="../../../../static/ipfs-logo.png" style="height: 11px"/> <a :href="edition.tokenUri" target="_blank">IPFS</a>
    </span>
</template>

<script>
  export default {
    name: 'ipfsBadge',
    props: ['edition']
  };
</script>

<style scoped lang="scss">

</style>
