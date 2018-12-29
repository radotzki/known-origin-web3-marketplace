<template>
     <span class="">
       #{{ edition.tokenId -  edition.edition}} <small>of {{ edition.totalAvailable }}</small>
    </span>
</template>

<script>
  export default {
    name: 'XOfXBadge',
    props: ['edition']
  };
</script>

<style scoped lang="scss">
</style>
