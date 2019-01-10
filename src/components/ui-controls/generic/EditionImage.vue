<template>
  <img v-if="src"
       v-lazy="src"
       :key="'edition_image_' + imgId"
       :id="'edition_image_' + imgId"
       alt="edition-image"/>
</template>

<script>
  export default {
    name: 'editionImage',
    props: ['src', 'id'],
    computed: {
      imgId() {
        if (this.id) {
          return this.id;
        }
        // generate random one
        return Math.floor(Math.random() * Math.floor(1000));
      }
    }
  };
</script>

<style scoped lang="scss">
  .v-lazy-image {
    filter: blur(0px);
    transition: filter 0.5s;
  }

  .v-lazy-image-loaded {
    filter: blur(0);
  }
</style>
