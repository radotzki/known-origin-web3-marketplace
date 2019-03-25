<template>
  <img v-if="src"
       v-lazy="image"
       :key="'edition_image_' + imgId"
       :id="'edition_image_' + imgId"
       alt="edition-image"/>
</template>

<script>

  import imgixClient from '../../../services/imgixClient';

  export default {
    name: 'editionImage',
    props: ['src', 'id'],
    computed: {
      image() {
        // FIXME - is this worth keeping?
        return imgixClient.buildURL(this.src, {
          //format - For browsers that support it, converts the image to the WebP format for better compression.
          //enhance - Applies a set of image adjustments to improve brightness, contrast, and other settings.
          auto: "format,enhance",
          q: 60 //Reduces the image quality slightly to improve compression (default is 75).
        });
      },
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
