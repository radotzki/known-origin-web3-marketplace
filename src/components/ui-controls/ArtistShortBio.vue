<template>
  <div v-if="artist"  class="clearfix">
    <h1>{{ artist.name }}</h1>
    <img :src="'../' + artist.img" class="float-left pr-4"/>
    <p class="mt-4 mb-4 ml-5 lead">{{ artist.strapline }}</p>
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

    .lead {
      font-size: 1rem;
    }
  }
</style>
