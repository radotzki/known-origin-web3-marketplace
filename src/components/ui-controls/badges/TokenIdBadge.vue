<template>
     <span class="badge badge-pill badge-extra-data">
         #{{ tokenId }}
    </span>
</template>

<script>
  export default {
    name: 'TokenIdBadge',
    props: ['tokenId']
  };
</script>

<style scoped lang="scss">
</style>
