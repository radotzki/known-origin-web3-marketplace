<template>
  <span>
    <h5 class="card-title">{{ edition.otherMeta.artworkName }}</h5>
    <!-- TODO handle linking to artists via artistCode not address -->
    <h6 class="card-subtitle mb-2 text-muted">
      By {{ edition.otherMeta.artist }}
    </h6>
  </span>
</template>

<script>
  export default {
    name: 'editionNameByArtist',
    props: ['edition', 'purchase'],
  };
</script>

<style scoped lang="scss">
  $body-color: #545454;

  a {
    color: $body-color;
  }
</style>
