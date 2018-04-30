<template>
  <div v-if="artist"  class="clearfix">
    <img :src="'../' + artist.img" class="float-right"/>
    <h1>{{ artist.name }}</h1>
    <p class="mt-2 mb-4 mr-5 lead">{{ artist.strapline }}</p>
  </div>
</template>

<script>
  export default {
    name: 'artistShortBio',
    props: ['artist'],
  };
</script>

<style scoped lang="scss">
  img {
    max-height: 125px;
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    img {
      max-height: 75px;
    }
  }
</style>
