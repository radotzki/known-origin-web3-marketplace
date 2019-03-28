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
        // FIXME - trail new imgix service
        return imgixClient.buildURL(this.src, {
          //format - For browsers that support it, converts the image to the WebP format for better compression.
          //enhance - Applies a set of image adjustments to improve brightness, contrast, and other settings.
          //compress - It will turn those GIFs into an animated WebP in supported browsers (such as Chrome)
          auto: "format,compress",
          q: 75, //Reduces the image quality slightly to improve compression (default is 75).
          'gif-q': 75 //Reduces the image quality of GIFS - the higher the number, the more compression applied to the GIF.
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
