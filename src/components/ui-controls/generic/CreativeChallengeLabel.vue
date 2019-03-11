<template>
  <span>
    <img v-if="devcon4"
         src="../../../../static/devcon_iv_logo.svg" class="img-fluid creative-challenge mr-2" alt="devcon4"/>
    <img v-else-if="auctionity"
         src="../../../../static/auctionity-small.png" class="img-fluid creative-challenge mr-2" alt="auctionity"/>
  </span>
</template>

<script>
  import _ from 'lodash';

  export default {
    name: 'CreativeChallengeLabel',
    props: ['attributes'],
    computed: {
      devcon4: function () {
        if (this.attributes) {
          const tags = _.get(this.attributes, 'tags', []);
          return _.includes(tags, 'creative challenge') && _.includes(tags, 'devcon4');
        }
        return null;
      },
      _0xcert: function () {
        if (this.attributes) {
          const tags = _.get(this.attributes, 'tags', []);
          return _.includes(tags, 'creative challenge') && _.includes(tags, '0xcert');
        }
        return null;
      },
      auctionity: function () {
        if (this.attributes) {
          const tags = _.get(this.attributes, 'tags', []);
          return _.includes(tags, 'creative challenge') && _.includes(tags, 'auctionity');
        }
        return null;
      }
    }
  };
</script>

<style scoped>

  .creative-challenge {
    max-height: 20px;
  }
</style>
