<template>
     <span class="">
       #{{ edition.tokenId -  edition.edition}} of {{ edition.totalAvailable }}
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
